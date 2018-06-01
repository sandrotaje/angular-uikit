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
    .directive('isolateForm', [function () {
        return {
            restrict: 'A',
            require: '?form',
            link: function (scope, elm, attrs, ctrl) {
                if (!ctrl) {
                    return;
                }
    
                // Do a copy of the controller
                var ctrlCopy = {};
                angular.copy(ctrl, ctrlCopy);
    
                // Get the parent of the form
                var parent = elm.parent().controller('form');
                // Remove parent link to the controller
                parent.$removeControl(ctrl);
    
                // Replace form controller with a "isolated form"
                var isolatedFormCtrl = {
                    $setValidity: function (validationToken, isValid, control) {
                        ctrlCopy.$setValidity(validationToken, isValid, control);
                        parent.$setValidity(validationToken, true, ctrl);
                    },
                    $setDirty: function () {
                        elm.removeClass('ng-pristine').addClass('ng-dirty');
                        ctrl.$dirty = true;
                        ctrl.$pristine = false;
                    },
                };
                angular.extend(ctrl, isolatedFormCtrl);
            }
        };
    }]);;
