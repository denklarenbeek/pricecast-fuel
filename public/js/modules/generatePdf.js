// import html2pdf from 'html2pdf';

export function generatePdf (report) {
    if(!report) return
    
    const title = document.getElementsByTagName("h1")[0].innerHTML;
    const period = document.getElementById('report-period').innerHTML.trim();
    console.log(title, period);
    let filename = `${title}_${period}`

    const opt = {
        margin: 0,
        filename: filename,
        pagebreak: {
            mode: 'avoid-all',
            after: '.page-end'
        },
        html2canvas: { scale: 2 },
        jsPDF:{ unit: 'mm', format: 'a3', orientation: 'landscape' }
    };

    const button = document.getElementById('generate-report');
    button.addEventListener('click', () => {
        html2pdf().set(opt).from(report).save();
    })

}
