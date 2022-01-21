import { $, $$ } from './modules/bling';
import {generateReport} from './modules/base';
import {generatePNG} from './modules/generatePng'
import {generatePdf} from './modules/generatePdf'
import {generateChart, closeModal} from './modules/generateChart';
import {initialize} from './modules/setLocalStorage';
import {loadProducts} from './modules/tableForm';
import {check2fa} from './modules/set2fa';
import {navigation} from './modules/navigation';
import {socket} from './modules/socket';
import {loadDocument, deletePopUp} from './modules/tableClick';

initialize();
socket();
closeModal($('#chart-modal'));
check2fa($('#loginForm'))
generateChart($('#generate-report'))
loadDocument('#documentTable')
generateReport($('#nextBtn'))
generatePNG($$('.downloadImage'))
generatePdf($('#customer-report'))
loadProducts($('#product-selector'))
navigation($('.navbar_button'))
deletePopUp($('#documentTable'))