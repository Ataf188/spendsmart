import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'
import * as XLSX from 'xlsx'

// ============================================
// PDF Export
// ============================================
export const exportToPDF = (expenses, totalIncome, totalExpense, balance) => {
  const doc = new jsPDF()

  // Header
  doc.setFillColor(99, 102, 241)
  doc.rect(0, 0, 210, 40, 'F')

  doc.setTextColor(255, 255, 255)
  doc.setFontSize(22)
  doc.setFont('helvetica', 'bold')
  doc.text('SpendSmart', 14, 20)

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Personal Finance Report', 14, 30)
  doc.text(`Generated: ${new Date().toLocaleDateString()}`, 140, 30)

  // Stats Cards
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')

  const stats = [
    { label: 'Balance', value: balance, color: balance >= 0 ? [34, 197, 94] : [239, 68, 68] },
    { label: 'Total Income', value: totalIncome, color: [34, 197, 94] },
    { label: 'Total Expenses', value: totalExpense, color: [239, 68, 68] },
  ]

  stats.forEach((stat, i) => {
    const x = 14 + i * 65
    doc.setFillColor(245, 245, 255)
    doc.roundedRect(x, 48, 60, 25, 3, 3, 'F')
    doc.setTextColor(100, 100, 100)
    doc.setFontSize(8)
    doc.setFont('helvetica', 'normal')
    doc.text(stat.label, x + 5, 57)
    doc.setTextColor(...stat.color)
    doc.setFontSize(12)
    doc.setFont('helvetica', 'bold')
    doc.text(`Rs. ${Number(stat.value).toLocaleString()}`, x + 5, 67)
  })

  // Table
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text('Transaction History', 14, 88)

  const tableData = expenses.map(e => [
    e.date,
    e.title,
    e.category,
    e.type.charAt(0).toUpperCase() + e.type.slice(1),
    `Rs. ${Number(e.amount).toLocaleString()}`,
  ])

  autoTable(doc, {
    startY: 92,
    head: [['Date', 'Title', 'Category', 'Type', 'Amount']],
    body: tableData,
    headStyles: {
      fillColor: [99, 102, 241],
      textColor: 255,
      fontStyle: 'bold',
      fontSize: 10,
    },
    bodyStyles: { fontSize: 9 },
    alternateRowStyles: { fillColor: [248, 248, 255] },
    didDrawCell: (data) => {
      if (data.column.index === 4 && data.section === 'body') {
        const expense = expenses[data.row.index]
        if (expense?.type === 'income') {
          data.cell.styles.textColor = [34, 197, 94]
        } else {
          data.cell.styles.textColor = [239, 68, 68]
        }
      }
    },
  })

  // Footer
  const pageCount = doc.internal.getNumberOfPages()
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setTextColor(150, 150, 150)
    doc.text(
      `SpendSmart - Page ${i} of ${pageCount}`,
      doc.internal.pageSize.width / 2,
      doc.internal.pageSize.height - 10,
      { align: 'center' }
    )
  }

  doc.save(`SpendSmart_Report_${new Date().toLocaleDateString().replace(/\//g, '-')}.pdf`)
}

// ============================================
// Excel Export
// ============================================
export const exportToExcel = (expenses, totalIncome, totalExpense, balance) => {
  const wb = XLSX.utils.book_new()

  // ---- Sheet 1: Transactions ----
  const transactionData = [
    ['SpendSmart - Transaction Report'],
    [`Generated: ${new Date().toLocaleDateString()}`],
    [],
    ['Date', 'Title', 'Category', 'Type', 'Amount (PKR)'],
    ...expenses.map(e => [
      e.date,
      e.title,
      e.category,
      e.type.charAt(0).toUpperCase() + e.type.slice(1),
      Number(e.amount),
    ]),
    [],
    ['', '', '', 'Total Income', totalIncome],
    ['', '', '', 'Total Expenses', totalExpense],
    ['', '', '', 'Balance', balance],
  ]

  const ws1 = XLSX.utils.aoa_to_sheet(transactionData)

  // Column widths
  ws1['!cols'] = [
    { wch: 12 }, { wch: 25 }, { wch: 15 }, { wch: 12 }, { wch: 15 }
  ]

  XLSX.utils.book_append_sheet(wb, ws1, 'Transactions')

  // ---- Sheet 2: Category Summary ----
  const categoryBreakdown = expenses
    .filter(e => e.type === 'expense')
    .reduce((acc, e) => {
      acc[e.category] = (acc[e.category] || 0) + Number(e.amount)
      return acc
    }, {})

  const categoryData = [
    ['Category', 'Amount (PKR)', 'Percentage'],
    ...Object.entries(categoryBreakdown).map(([cat, amt]) => [
      cat,
      amt,
      `${((amt / totalExpense) * 100).toFixed(1)}%`
    ]),
  ]

  const ws2 = XLSX.utils.aoa_to_sheet(categoryData)
  ws2['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 12 }]
  XLSX.utils.book_append_sheet(wb, ws2, 'Category Summary')

  // ---- Sheet 3: Monthly Summary ----
  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  const monthlyData = months.map((m, i) => {
    const inc = expenses.filter(e => e.type === 'income' && new Date(e.date).getMonth() === i).reduce((s, e) => s + Number(e.amount), 0)
    const exp = expenses.filter(e => e.type === 'expense' && new Date(e.date).getMonth() === i).reduce((s, e) => s + Number(e.amount), 0)
    return [m, inc, exp, inc - exp]
  })

  const monthlySheet = [
    ['Month', 'Income (PKR)', 'Expenses (PKR)', 'Balance (PKR)'],
    ...monthlyData,
  ]

  const ws3 = XLSX.utils.aoa_to_sheet(monthlySheet)
  ws3['!cols'] = [{ wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 15 }]
  XLSX.utils.book_append_sheet(wb, ws3, 'Monthly Summary')

  XLSX.writeFile(wb, `SpendSmart_Report_${new Date().toLocaleDateString().replace(/\//g, '-')}.xlsx`)
}
