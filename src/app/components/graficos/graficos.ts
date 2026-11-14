import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { GraficoService } from '../../services/GraficoService';
import { NegocioService } from '../../services/NegocioService';
import { GraficoMensualResponse, MesGrafico } from '../../models/grafico';
import { NegocioResponse } from '../../models/negocio';

interface Barra {
  x: number;
  y: number;
  w: number;
  h: number;
  clase: string;
}

interface Grupo {
  mes: MesGrafico;
  xBanda: number;
  wBanda: number;
  xEtiqueta: number;
  barras: Barra[];
}

interface Tick {
  y: number;
  texto: string;
}

@Component({
  selector: 'app-graficos',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './graficos.html',
  styleUrl: './graficos.scss',
})
export class Graficos implements OnInit {
  readonly W = 760;
  readonly H = 300;
  private readonly M = { izq: 56, der: 10, arr: 12, abajo: 28 };

  negocios: NegocioResponse[] = [];
  idNegocio = '';
  anio = 0;
  datos: GraficoMensualResponse | null = null;
  cargando = false;
  error = '';
  verTabla = false;

  // Grafico 1: ingresos / egresos / gastos por mes
  grupos: Grupo[] = [];
  ticks: Tick[] = [];
  y0 = 0;

  // Grafico 2: utilidad por mes
  gruposUtil: Grupo[] = [];
  ticksUtil: Tick[] = [];
  y0Util = 0;

  hover: number | null = null;
  hoverUtil: number | null = null;

  constructor(
    private graficoService: GraficoService,
    private negocioService: NegocioService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.negocioService.misNegocios().subscribe({
      next: (data) => {
        this.negocios = data;
        if (data.length > 0) {
          this.idNegocio = data[0].idNegocio;
          this.cargar();
        }
        this.cd.detectChanges();
      },
      error: () => {
        this.error = 'No se pudieron cargar tus negocios';
        this.cd.detectChanges();
      },
    });
  }

  cambiarNegocio() {
    this.anio = 0;
    this.cargar();
  }

  cargar() {
    if (!this.idNegocio) return;
    this.cargando = true;
    this.error = '';
    this.graficoService.mensual(this.idNegocio, this.anio || undefined).subscribe({
      next: (d) => {
        this.datos = d;
        this.anio = d.anio;
        this.construir(d);
        this.cargando = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.error = 'No se pudo cargar el gráfico';
        this.cargando = false;
        this.cd.detectChanges();
      },
    });
  }

  get anios(): number[] {
    const lista = this.datos?.aniosDisponibles ?? [];
    return lista.includes(this.anio) ? lista : [...lista, this.anio].sort();
  }

  get sinDatos(): boolean {
    const t = this.datos?.totales;
    return !t || (t.ingresos === 0 && t.egresos === 0 && t.gastos === 0);
  }

  private construir(d: GraficoMensualResponse) {
    // Grafico 1: tres barras por mes, desde 0
    const max1 = Math.max(0, ...d.meses.flatMap((m) => [m.ingresos, m.egresos, m.gastos]));
    const esc1 = this.escala(0, max1);
    this.y0 = this.yDe(0, esc1);
    this.ticks = this.hacerTicks(esc1);
    this.grupos = d.meses.map((m, i) =>
      this.grupo(m, i, [
        { v: m.ingresos, c: 'ingresos' },
        { v: m.egresos, c: 'egresos' },
        { v: m.gastos, c: 'gastos' },
      ], esc1)
    );

    // Grafico 2: utilidad (puede ser negativa)
    const vals = d.meses.map((m) => m.utilidad);
    const esc2 = this.escala(Math.min(0, ...vals), Math.max(0, ...vals));
    this.y0Util = this.yDe(0, esc2);
    this.ticksUtil = this.hacerTicks(esc2);
    this.gruposUtil = d.meses.map((m, i) =>
      this.grupo(m, i, [{ v: m.utilidad, c: m.utilidad >= 0 ? 'util-pos' : 'util-neg' }], esc2)
    );
  }

  private grupo(m: MesGrafico, i: number, series: { v: number; c: string }[], esc: Escala): Grupo {
    const ancho = this.W - this.M.izq - this.M.der;
    const banda = ancho / 12;
    const xBanda = this.M.izq + i * banda;
    const gap = 2;
    const wBarra = Math.min(16, (banda * 0.7 - gap * (series.length - 1)) / series.length);
    const total = wBarra * series.length + gap * (series.length - 1);
    const x0 = xBanda + (banda - total) / 2;
    const yCero = this.yDe(0, esc);
    const barras = series.map((s, k) => {
      const yv = this.yDe(s.v, esc);
      return {
        x: x0 + k * (wBarra + gap),
        y: Math.min(yv, yCero),
        w: wBarra,
        h: Math.max(Math.abs(yCero - yv), s.v !== 0 ? 1 : 0),
        clase: s.c,
      };
    });
    return { mes: m, xBanda, wBanda: banda, xEtiqueta: xBanda + banda / 2, barras };
  }

  // Escala con valores "redondos"
  private escala(min: number, max: number): Escala {
    if (max === 0 && min === 0) max = 1;
    const paso = this.paso((max - min) / 4);
    return {
      min: Math.floor(min / paso) * paso,
      max: Math.ceil(max / paso) * paso,
      paso,
    };
  }

  private paso(bruto: number): number {
    const exp = Math.pow(10, Math.floor(Math.log10(bruto)));
    const f = bruto / exp;
    const n = f <= 1 ? 1 : f <= 2 ? 2 : f <= 5 ? 5 : 10;
    return n * exp;
  }

  private yDe(v: number, e: Escala): number {
    const alto = this.H - this.M.arr - this.M.abajo;
    return this.M.arr + alto - ((v - e.min) / (e.max - e.min)) * alto;
  }

  private hacerTicks(e: Escala): Tick[] {
    const t: Tick[] = [];
    for (let v = e.min; v <= e.max + e.paso / 2; v += e.paso) {
      t.push({ y: this.yDe(v, e), texto: this.compacto(v) });
    }
    return t;
  }

  compacto(v: number): string {
    const a = Math.abs(v);
    const s = v < 0 ? '-' : '';
    if (a >= 1_000_000) return s + this.dec(a / 1_000_000) + 'M';
    if (a >= 10_000) return s + this.dec(a / 1000) + 'K';
    return s + new Intl.NumberFormat('es-CO').format(a);
  }

  private dec(n: number): string {
    return (Math.round(n * 10) / 10).toString();
  }

  moneda(v: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);
  }

  // Barra con el extremo de datos redondeado (4px) y la base cuadrada sobre la linea cero
  ruta(b: Barra, y0: number): string {
    if (b.h <= 0) return '';
    const r = Math.min(4, b.w / 2, b.h);
    const x2 = b.x + b.w;
    if (Math.abs(b.y + b.h - y0) < 0.01) {
      return `M${b.x},${y0}V${b.y + r}Q${b.x},${b.y} ${b.x + r},${b.y}H${x2 - r}Q${x2},${b.y} ${x2},${b.y + r}V${y0}Z`;
    }
    const f = b.y + b.h;
    return `M${b.x},${y0}V${f - r}Q${b.x},${f} ${b.x + r},${f}H${x2 - r}Q${x2},${f} ${x2},${f - r}V${y0}Z`;
  }

  tooltipLeft(g: Grupo): number {
    return ((g.xEtiqueta) / this.W) * 100;
  }
}

interface Escala {
  min: number;
  max: number;
  paso: number;
}
