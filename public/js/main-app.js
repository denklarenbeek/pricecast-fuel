import { $, $$ } from './modules/bling';
import {generateReport} from './modules/base';
import {generatePNG} from './modules/generatePng'
import {generatePdf} from './modules/generatePdf'
import {initialize} from './modules/setLocalStorage';
import {loadProducts} from './modules/tableForm';
import {check2fa} from './modules/set2fa';

initialize();
check2fa($('#loginForm'))
generateReport($('#nextBtn'))
generatePNG($$('.downloadImage'))
generatePdf($('#customer-report'))
loadProducts($('#product-selector'))