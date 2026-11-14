import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/AuthService';
import { MovimientoService } from '../../services/MovimientoService';
import { MovimientoFinancieroResponse } from '../../models/movimiento';

type Periodo = 'semana' | 'mes' | 'anio';

interface Segmento {
  nombre: string;
  valor: number;
  pct: number;
  color: string;
  dash: string;
  offset: number;
}

interface Punto {
  etiqueta: string;
  ingresos: number;
  egresos: number;
  x: number;
  yIngresos: number;
  yEgresos: number;
}

interface Cubeta {
  ini: Date;
  fin: Date;
  etiqueta: string;
  ingresos: number;
  egresos: number;
}

const MESES_CORTOS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

// Paleta de la app: verdes, arena y grises
const COLORES = ['#3f6a4d', '#f0c987', '#7d9a85', '#d9b38c', '#8aa0a8'];
const COLOR_OTROS = '#b9c2b9';

const FMT_MONEDA = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 });
const FMT_COMPACTO = new Intl.NumberFormat('es-CO', { notation: 'compact', maximumFractionDigits: 1 });

@Component({
  selector: 'app-analisis-negocio',
  imports: [CommonModule],
  templateUrl: './analisis-negocio.html',
  styleUrl: './analisis-negocio.scss',
})
export class AnalisisNegocio implements OnInit {
  readonly periodos: { id: Periodo; texto: string }[] = [
    { id: 'semana', texto: 'Últimos 7 días' },
    { id: 'mes', texto: 'Último mes' },
    { id: 'anio', texto: 'Último año' },
  ];
  periodo: Periodo = 'mes';

  cargando = true;
  error = '';
  todos: MovimientoFinancieroResponse[] = [];

  // Dona
  readonly radio = 70;
  totalGastos = 0;
  segmentos: Segmento[] = [];

  // Líneas
  readonly W = 600;
  readonly H = 280;
  readonly L = 52;
  readonly R = 16;
  readonly T = 14;
  readonly B = 32;
  puntos: Punto[] = [];
  ticksY: { y: number; texto: string }[] = [];
  rutaIngresos = '';
  rutaEgresos = '';
  areaIngresos = '';
  hayLineas = false;
  hover: number | null = null;

  constructor(
    private auth: AuthService,
    private movimientoService: MovimientoService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    const id = this.auth.getNegocio()?.idNegocio;
    if (!id) {
      this.cargando = false;
      return;
    }
    this.movimientoService.listarPorNegocio(id).subscribe({
      next: (movs) => {
        this.todos = movs;
        this.calcular();
        this.cargando = false;
        this.cd.detectChanges();
      },
      error: () => {
        this.error = 'No se pudieron cargar los datos del análisis';
        this.cargando = false;
        this.cd.detectChanges();
      },
    });
  }

  cambiar(p: Periodo) {
    this.periodo = p;
    this.hover = null;
    this.calcular();
  }

  moneda(v: number): string {
    return FMT_MONEDA.format(v);
  }

  compacto(v: number): string {
    return FMT_COMPACTO.format(v);
  }

  get bandaAncho(): number {
    return (this.W - this.L - this.R) / Math.max(this.puntos.length - 1, 1);
  }

  // ---------------------------------------------------------------

  private clase(m: MovimientoFinancieroResponse): 'ingreso' | 'egreso' | 'gasto' | 'otro' {
    const n = (m.tipoMovimiento?.nombre ?? '').trim().toUpperCase();
    if (n.startsWith('INGRES')) return 'ingreso';
    if (n.startsWith('EGRES')) return 'egreso';
    if (n.startsWith('GAST')) return 'gasto';
    return 'otro';
  }

  private fecha(m: MovimientoFinancieroResponse): Date {
    // "yyyy-MM-dd" sin hora se interpretaría en UTC y correría un día; se fuerza a hora local
    const f = m.fecha.length === 10 ? m.fecha + 'T00:00:00' : m.fecha;
    return new Date(f);
  }

  private cubetas(): { inicio: Date; fin: Date; lista: Cubeta[] } {
    const hoy = new Date();
    const y = hoy.getFullYear();
    const m = hoy.getMonth();
    const d = hoy.getDate();
    const fin = new Date(y, m, d + 1); // exclusivo: incluye todo el día de hoy
    const lista: Cubeta[] = [];

    if (this.periodo === 'anio') {
      for (let i = 11; i >= 0; i--) {
        const ini = new Date(y, m - i, 1);
        const sig = new Date(y, m - i + 1, 1);
        lista.push({ ini, fin: sig, etiqueta: MESES_CORTOS[ini.getMonth()], ingresos: 0, egresos: 0 });
      }
    } else {
      const dias = this.periodo === 'semana' ? 7 : 30;
      const paso = this.periodo === 'semana' ? 1 : 5;
      for (let i = 0; i < dias; i += paso) {
        const ini = new Date(y, m, d - (dias - 1) + i);
        const sig = new Date(y, m, d - (dias - 1) + i + paso);
        lista.push({ ini, fin: sig, etiqueta: `${ini.getDate()} ${MESES_CORTOS[ini.getMonth()]}`, ingresos: 0, egresos: 0 });
      }
    }
    return { inicio: lista[0].ini, fin, lista };
  }

  private calcular() {
    const { inicio, fin, lista } = this.cubetas();
    const gastosPorCategoria = new Map<string, number>();

    for (const mov of this.todos) {
      const t = this.fecha(mov);
      if (t < inicio || t >= fin) continue;
      const c = this.clase(mov);

      if (c === 'gasto') {
        const cat = mov.origen?.nombre?.trim() || 'Sin categoría';
        gastosPorCategoria.set(cat, (gastosPorCategoria.get(cat) ?? 0) + mov.monto);
      }
      if (c === 'ingreso' || c === 'egreso') {
        const cub = lista.find((b) => t >= b.ini && t < b.fin);
        if (cub) {
          if (c === 'ingreso') cub.ingresos += mov.monto;
          else cub.egresos += mov.monto;
        }
      }
    }

    this.calcularDona(gastosPorCategoria);
    this.calcularLineas(lista);
  }

  private calcularDona(porCategoria: Map<string, number>) {
    const orden = [...porCategoria.entries()].sort((a, b) => b[1] - a[1]);
    const principales = orden.slice(0, COLORES.length);
    const resto = orden.slice(COLORES.length).reduce((s, [, v]) => s + v, 0);

    const items = principales.map(([nombre, valor], i) => ({ nombre, valor, color: COLORES[i] }));
    if (resto > 0) items.push({ nombre: 'Otros', valor: resto, color: COLOR_OTROS });

    const total = items.reduce((s, i) => s + i.valor, 0);
    this.totalGastos = total;

    const C = 2 * Math.PI * this.radio;
    const hueco = items.length > 1 ? 2 : 0;
    let acumulado = 0;

    this.segmentos = total <= 0 ? [] : items.map((i) => {
      const largo = (i.valor / total) * C;
      const seg: Segmento = {
        nombre: i.nombre,
        valor: i.valor,
        pct: (i.valor / total) * 100,
        color: i.color,
        dash: `${Math.max(largo - hueco, 0.5)} ${C}`,
        offset: -acumulado,
      };
      acumulado += largo;
      return seg;
    });
  }

  private calcularLineas(lista: Cubeta[]) {
    const iw = this.W - this.L - this.R;
    const ih = this.H - this.T - this.B;
    const maxVal = Math.max(0, ...lista.map((b) => Math.max(b.ingresos, b.egresos)));
    this.hayLineas = maxVal > 0;

    const yMax = this.maximoRedondo(maxVal);
    const y = (v: number) => this.T + ih - (v / yMax) * ih;
    const x = (i: number) => this.L + (lista.length === 1 ? iw / 2 : (i * iw) / (lista.length - 1));

    this.ticksY = [0, 1, 2, 3, 4].map((i) => ({ y: y((yMax * i) / 4), texto: this.compacto((yMax * i) / 4) }));

    this.puntos = lista.map((b, i) => ({
      etiqueta: b.etiqueta,
      ingresos: b.ingresos,
      egresos: b.egresos,
      x: x(i),
      yIngresos: y(b.ingresos),
      yEgresos: y(b.egresos),
    }));

    const ruta = (campo: 'yIngresos' | 'yEgresos') =>
      this.puntos.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x.toFixed(1)} ${p[campo].toFixed(1)}`).join(' ');

    this.rutaIngresos = ruta('yIngresos');
    this.rutaEgresos = ruta('yEgresos');

    const base = (this.T + ih).toFixed(1);
    const primero = this.puntos[0];
    const ultimo = this.puntos[this.puntos.length - 1];
    this.areaIngresos = `${this.rutaIngresos} L${ultimo.x.toFixed(1)} ${base} L${primero.x.toFixed(1)} ${base} Z`;
  }

  // Máximo "redondo" para el eje vertical (4 intervalos iguales)
  private maximoRedondo(v: number): number {
    if (v <= 0) return 4;
    const crudo = v / 4;
    const mag = Math.pow(10, Math.floor(Math.log10(crudo)));
    const n = crudo / mag;
    const f = n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10;
    return f * mag * 4;
  }
}