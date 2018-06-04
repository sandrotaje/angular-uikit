import ukNgAutocomplete from './angular-uikit-autocomplete';
import ukNgPagination from './angular-uikit-pagination';
import ukNgJsonTableForm from './angular-uikit-jsontableform';
import ukNgCalendar from './angular-uikit-calendar';
import ukNgSortableItem from './angular-uikit-sortable-item';
import ukNgSortable from './angular-uikit-sortable';
import ukNgNotAllowArrayDuplicate from './angular-uikit-notallowarrayduplicate';
import hxSubmitOnEnter from './angular-uikit-hx-submit-on-enter';

angular.module('angularUikit', [])
    .directive('ukNgAutocomplete', ukNgAutocomplete)
    .directive('ukNgPagination', ukNgPagination)
    .directive('ukNgJsonTableForm', ukNgJsonTableForm)
    .directive('ukNgCalendar', ukNgCalendar)
    .directive('ukNgSortableItem', ukNgSortableItem)
    .directive('ukNgSortable', ukNgSortable)
    .directive('ukNgNotAllowArrayDuplicate', ukNgNotAllowArrayDuplicate)
    .directive('hxSubmitOnEnter', hxSubmitOnEnter)
    .directive('isolateForm', function() {
        return {
          restrict: 'A',
          require: '?form',
          link: function(scope, element, attrs, formController) {
            if (!formController) {
              return;
            }
      
            var parentForm = formController.$$parentForm; // Note this uses private API
            if (!parentForm) {
              return;
            }
      
            // Remove this form from parent controller
            parentForm.$removeControl(formController);
          }
        };
      });
;
