import * as htmlToImage from 'html-to-image';

export function generatePNG (buttons) {
    if(!buttons) return

    // TODO Exclude the buttons in the PNG file
    const filter = (node)=>{
        const exclusionClasses = ['buttons'];
        return !exclusionClasses.some(classname=>node.classList.includes(classname));
    }
    buttons.map((button, index) => {
        button.addEventListener('click', () => {
            const node = document.getElementById(button.dataset.product)
            console.log(node.dataset.customer)
            htmlToImage.toBlob(node, {backgroundColor: '#FFFFFF'})
            .then(function (blob) {
                window.saveAs(blob, `pricecast_fuel_report-${node.dataset.customer}.png`);
            });
        })
    })
}