
export function loadDocument (table) {
    if(!table) return

    const tableRows = document.querySelectorAll('.tableClick')
    console.log(tableRows)
    
    tableRows.map(row => {
        row.addEventListener('click', (e) => {
            console.log(row.dataset.id)
            window.location.href = `/documents/${row.dataset.id}`
        })
    })
};