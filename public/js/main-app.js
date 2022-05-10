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
import {showdropdown, deletePopUp, doubleClicktoDelete} from './modules/tableClick';
import {handleFlashMessages} from './modules/flash';
import {homeTools} from './modules/homeTools';
import {createNewCustomer, taskStatus} from './modules/settings';
import {createNewProduct, editProduct} from './modules/settings';
import {pagination} from './modules/tableClick';
import {shareReport} from './modules/tableClick'
import {saveContact} from './modules/saveContact';

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
doubleClicktoDelete($('#documentTable'))
pagination($('.pagination'))
shareReport($$('.sharebutton'))
createNewProduct($('#add-product'))
editProduct($('#add-product'))
createNewCustomer($('#add-customer'))

saveContact($('#crmForm'))