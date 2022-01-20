import { $, $$ } from './modules/bling';
import {generateReport} from './modules/base';
import {generatePNG} from './modules/generatePng'
import {generatePdf} from './modules/generatePdf'
import {initialize} from './modules/setLocalStorage';
import {loadProducts} from './modules/tableForm';
import {check2fa} from './modules/set2fa';
import {navigation} from './modules/navigation';
// import {socket} from './modules/socket';
import {loadDocument} from './modules/tableClick';

initialize();
// socket();
check2fa($('#loginForm'))
loadDocument('#documentTable')
generateReport($('#nextBtn'))
generatePNG($$('.downloadImage'))
generatePdf($('#customer-report'))
loadProducts($('#product-selector'))
navigation($('.navbar_button'))