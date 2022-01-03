// import html2pdf from 'html2pdf';

export function generatePdf (report) {
    if(!report) return
    

    const opt = {
        filename: 'myfile.pdf',
        pagebreak: {
            mode: 'avoid-all',
            after: '.page-end'
        },
        html2canvas: { scale: 4 },
        jsPDF:{ unit: 'mm', format: 'a3', orientation: 'landscape' }
    };

    const button = document.getElementById('generate-report');
    button.addEventListener('click', () => {
        html2pdf().set(opt).from(report).save();
    })

}
