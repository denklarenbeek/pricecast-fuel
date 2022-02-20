import { $, $$ } from './modules/bling';
import {generateReport} from './modules/submitForm';
import {generatePNG} from './modules/generatePng'
import {generatePdf} from './modules/generatePdf'
import {generateChart, closeModal} from './modules/generateChart';
import {initialize} from './modules/setLocalStorage';
import {loadProducts} from './modules/tableForm';
import {check2fa} from './modules/set2fa';
import {navigation} from './modules/navigation';
import {socket} from './modules/socket';
import {showdropdown, deletePopUp} from './modules/tableClick';
import {handleFlashMessages} from './modules/flash';
import {homeTools} from './modules/homeTools';
import {taskStatus} from './modules/taskStatus';

initialize();
socket();
handleFlashMessages();
taskStatus($('#getActiveJobs'));
homeTools('#(#home)');
closeModal($('#chart-modal'));
check2fa($('#loginForm'))
generateChart($('#generate-report'))
showdropdown('#documentTable')
generateReport($('#submitFormData'))
generatePNG($$('.downloadImage'))
generatePdf($('#customer-report'))
loadProducts($('#product-selector'))
navigation($('.navbar_button'))
deletePopUp($('#documentTable'))