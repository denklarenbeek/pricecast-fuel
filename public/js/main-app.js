import { $, $$ } from './modules/bling';
import {generateReport} from './modules/base';
import {generatePNG} from './modules/generatePng'
import {generatePdf} from './modules/generatePdf'
import {initialize} from './modules/setLocalStorage';
import {loadProducts} from './modules/tableForm';

initialize();
generateReport($('#nextBtn'))
generatePNG($$('.downloadImage'))
generatePdf($('#customer-report'))
loadProducts($('#product-selector'))