import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { MovimientoFinancieroResponse } from '../models/movimiento';

export interface DatosReporte {
  negocio: string;
  mes: number; // 1-12
  anio: number;
  movimientos: MovimientoFinancieroResponse[];
}

export type ClaseMovimiento = 'ingreso' | 'egreso' | 'gasto' | 'otro';

export const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

export function clasificar(m: MovimientoFinancieroResponse): ClaseMovimiento {
  const n = (m.tipoMovimiento?.nombre ?? '').trim().toUpperCase();
  if (n.startsWith('INGRES')) return 'ingreso';
  if (n.startsWith('EGRES')) return 'egreso';
  if (n.startsWith('GAST')) return 'gasto';
  return 'otro';
}

export function moneda(v: number): string {
  return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(v);
}

export function totales(movs: MovimientoFinancieroResponse[]) {
  let ingresos = 0, egresos = 0, gastos = 0;
  for (const m of movs) {
    const c = clasificar(m);
    if (c === 'ingreso') ingresos += m.monto;
    else if (c === 'egreso') egresos += m.monto;
    else if (c === 'gasto') gastos += m.monto;
  }
  return { ingresos, egresos, gastos, utilidad: ingresos - egresos - gastos };
}

// Deja solo los movimientos del mes/anio y los ordena por fecha
export function filtrarMes(movs: MovimientoFinancieroResponse[], mes: number, anio: number) {
  return movs
    .filter((m) => {
      const d = new Date(m.fecha);
      return d.getFullYear() === anio && d.getMonth() + 1 === mes;
    })
    .sort((a, b) => new Date(a.fecha).getTime() - new Date(b.fecha).getTime());
}

const AZUL: [number, number, number] = [42, 120, 214];

export function generarReportePdf(d: DatosReporte): jsPDF {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' });
  const ancho = doc.internal.pageSize.getWidth();
  const t = totales(d.movimientos);
  const titulo = `${MESES[d.mes - 1]} ${d.anio}`;

  // Encabezado
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text('Reporte mensual', 40, 50);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(82, 81, 78);
  doc.text(`${d.negocio}  ·  ${titulo}`, 40, 70);
  doc.setFontSize(9);
  doc.text(`Generado el ${new Date().toLocaleDateString('es-CO')}`, ancho - 40, 50, { align: 'right' });
  doc.setTextColor(0, 0, 0);

  // Resumen
  autoTable(doc, {
    startY: 92,
    head: [['Resumen del mes', 'Total']],
    body: [
      ['Ingresos', moneda(t.ingresos)],
      ['Egresos', moneda(t.egresos)],
      ['Gastos', moneda(t.gastos)],
      ['Utilidad (ingresos - egresos - gastos)', moneda(t.utilidad)],
    ],
    theme: 'grid',
    headStyles: { fillColor: AZUL },
    columnStyles: { 1: { halign: 'right' } },
    styles: { fontSize: 10 },
    didParseCell: (h) => {
      if (h.section === 'head' && h.column.index === 1) h.cell.styles.halign = 'right';
      if (h.section === 'body' && h.row.index === 3) h.cell.styles.fontStyle = 'bold';
    },
  });

  // Detalle por tipo de movimiento
  const porTipo = new Map<string, { clase: string; cant: number; total: number }>();
  for (const m of d.movimientos) {
    const nombre = m.tipoMovimiento?.nombre ?? 'Sin tipo';
    const x = porTipo.get(nombre) ?? { clase: clasificar(m), cant: 0, total: 0 };
    x.cant += 1;
    x.total += m.monto;
    porTipo.set(nombre, x);
  }
  const filasTipo = [...porTipo.entries()]
    .sort((a, b) => b[1].total - a[1].total)
    .map(([n, x]) => [n, String(x.cant), moneda(x.total)]);

  if (filasTipo.length) {
    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 20,
      head: [['Por tipo de movimiento', 'Cantidad', 'Total']],
      body: filasTipo,
      theme: 'striped',
      headStyles: { fillColor: AZUL },
      columnStyles: { 1: { halign: 'right' }, 2: { halign: 'right' } },
      styles: { fontSize: 9 },
      didParseCell: (h) => {
        if (h.section === 'head' && h.column.index >= 1) h.cell.styles.halign = 'right';
      },
    });
  }

  // Detalle de movimientos
  const filas = d.movimientos.map((m) => [
    new Date(m.fecha).toLocaleDateString('es-CO'),
    m.tipoMovimiento?.nombre ?? '',
    m.origen?.nombre ?? '',
    m.descricion ?? '',
    moneda(m.monto),
  ]);

  autoTable(doc, {
    startY: (doc as any).lastAutoTable.finalY + 20,
    head: [['Fecha', 'Tipo', 'Origen', 'Descripción', 'Monto']],
    body: filas.length ? filas : [[{ content: 'No hay movimientos en este mes', colSpan: 5, styles: { halign: 'center' } } as any]],
    theme: 'striped',
    headStyles: { fillColor: AZUL },
    columnStyles: { 4: { halign: 'right' } },
    styles: { fontSize: 8, cellPadding: 4 },
    didParseCell: (h) => {
      if (h.section === 'head' && h.column.index === 4) h.cell.styles.halign = 'right';
    },
  });

  // Numero de pagina
  const paginas = doc.getNumberOfPages();
  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(137, 135, 129);
    doc.text(`GestroContable · Página ${i} de ${paginas}`, ancho / 2, doc.internal.pageSize.getHeight() - 20, { align: 'center' });
  }
  return doc;
}

export function nombreArchivo(negocio: string, mes: number, anio: number): string {
  const limpio = negocio.normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-zA-Z0-9]+/g, '_');
  return `reporte_${limpio}_${anio}-${String(mes).padStart(2, '0')}.pdf`;
}
