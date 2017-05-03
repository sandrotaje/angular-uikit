import './angular-uikit-jsontableform.scss';

ukNgJsonTableForm.$inject = ['$compile', '$timeout'];
export default function ukNgJsonTableForm($compile, $timeout) {
        return {
            restrict: "EA",
            scope: {
                model: "=",
                structure: "=",
                onlyread: "=",
                allHeaderInHead: "="
            },
            link: function (scope, element, attrs) {
                scope.newItem = {};
                if (!scope.model) {
                    scope.model = [];
                }
                var table = generateTable(scope.model, scope.structure);
                element.append($compile(angular.element(table))(scope));

                scope.addItem = function () {
                    scope.model.push(angular.copy(scope.newItem));
                    scope.newItem = {};
                };

                scope.removeItem = function removeItem(index) {

                    UIkit.modal.confirm("Sei sicuro?", function () {
                        $timeout(function () {
                            scope.model.splice(index, 1)
                        });
                    });

                };

                scope.getHeaders = function (struct) {
                    var firstRow = [];
                    var secondRow = [];
                    var countNotArray = function (array) {
                        return array.filter(function (el) {
                            return el.type != 'array';
                        }).length;
                    };
                    var first = true;
                    var recur = function (arr) {
                        arr.forEach(function (s) {
                            if (s.type != 'array') {
                                if (first) {
                                    firstRow.push({ colspan: 1 });
                                }
                                secondRow.push(s);
                            } else {
                                first = false;

                                var colspan = countNotArray(s.items);

                                firstRow.push({
                                    label: s.label,
                                    colspan: colspan
                                });
                                recur(s.items);
                            }
                        });
                    };
                    recur(struct);
                    return { firstRow: firstRow, secondRow: secondRow };
                };

                scope.generateTable = generateTable;

            }
        };

        function generateTable(model, structure) {
            var element = '<form name="newItemForm" class="uk-form uk-form-stacked" ng-submit="addItem()" novalidate><fieldset><table ng-init="table.hasChild = false" class="uk-table uk-ng-table-form">';

            //creating header
            element += '<thead ng-if="!allHeaderInHead"><tr>';
            element += '<th data-ng-repeat="h in structure">';
            element += '<div ng-switch="h.type">';
            element += '<div ng-switch-when="array" ng-init="table.hasChild = true"></div>';
            element += '<span ng-switch-default><i ng-if="h.icon" class="uk-icon-{{h.icon}}"></i> {{h.label}}</span>';
            element += '</div>';
            element += '</th>';
            element += '<th ng-if="!onlyread"></th>';
            element += '</tr></thead>';
            element += '<thead ng-if="allHeaderInHead" ng-init="thead = getHeaders(structure)">' +
                '<tr><th data-ng-repeat="h in thead.firstRow" colspan="{{h.colspan}}">{{h.label}}</th></tr>' +
                '<tr><th data-ng-repeat="h in thead.secondRow">{{h.label}}</th></tr></thead>';



            //---------------------

            element += '<tbody>';

            element += '<tr class="" data-ng-repeat="m in model track by $index" ng-init="row.index=$index+1">';
            element += '<td data-ng-repeat="s in structure" ng-class="{\'uk-table-middle\': s.type!= \'array\'}">';
            element += '<div ng-switch="s.type">';


            element += '<div ng-switch-when="array" class="uk-accordion" data-uk-accordion="{showfirst: false, collapse: false, toggle: \'.uk-accordion-title-{{s.property}}\', containers:\'.uk-accordion-content-{{s.property}}\'}">';
            element += '<a ng-init="accordion.show = false" ng-click="accordion.show=!accordion.show" class="uk-width-1-1 uk-button uk-button-primary uk-button-large uk-accordion-title-{{s.property}}"><span class="uk-float-left"><i ng-if="s.icon" class="uk-icon-{{s.icon}}"></i> {{m[s.property].length}} {{s.label}} </span> <span class="uk-float-right"><i ng-hide="accordion.show" class="uk-icon-caret-right"></i><i ng-show="accordion.show" class="uk-icon-caret-down"></i></span></a>';
            element += '<div class="uk-accordion-content-{{s.property}}">';
            element += '<div data-uk-ng-json-table-form data-model="m[s.property]" data-structure="s.items" data-onlyread="onlyread" data-allHeaderInHead="allHeaderInHead"></div>';
            element += '</div></div>';
            
            
            // element += '<div ng-switch-when="autocomplete">{{m[s.property][s.autocomplete.label]?m[s.property][s.autocomplete.label]:m[s.property]}}</div>';
            // element += '<div ng-switch-when="select">{{m[s.property][s.select.label]}}</div>';
            // element += '<div ng-switch-when="sequence" ng-init="m.sequence = row.index">{{m.sequence}}</div>';
            // element += '<div ng-switch-default>{{m[s.property]}}</div>';


            element += '<div ng-switch-when="autocomplete">{{m[s.property][s.autocomplete.label]?m[s.property][s.autocomplete.label]:m[s.property]}}</div>';
            element += '<div ng-switch-when="sequence">{{m.sequence = row.index}}</div>';

            element += '<div ng-switch-when="select">';
            element += '<select ng-if="s.select.label"  name="{{s.property}}" data-ng-model="m[s.property]" class="uk-width-1-1" ng-options="opt[s.select.label] for opt in s.select.options track by opt[s.select.id]" ng-required="s.required" />';
            element += '<select ng-if="!s.select.label" name="{{s.property}}" data-ng-model="m[s.property]" class="uk-width-1-1" ng-options="opt for opt in s.select.options" ng-required="s.required" />';
            element += '</div>';

            //element += '<div ng-switch-when="autocomplete" class="uk-autocomplete uk-form uk-width-1-1"><input name="{{s.property}}" type="text" placeholder="{{s.placeholder?s.placeholder:\'\'}}" class="uk-width-1-1" ng-model="m[s.property]" data-uk-source-path="s.autocomplete.sourcePath" data-uk-source="s.autocomplete.source" data-uk-label="s.autocomplete.label" uk-ng-autocomplete required></div>';
            element += '<input name="{{s.property}}" ng-switch-when="number" data-ng-model="m[s.property]" type="number" class="uk-form-blank uk-width-1-1" data-ng-max="{{s.number.max}}" data-ng-min="{{s.number.min}}" required>';
            element += '<input name="{{s.property}}" ng-switch-default data-ng-model="m[s.property]" type="{{s.type}}" placeholder="{{s.placeholder?s.placeholder:\'\'}}" class="uk-form-blank uk-width-1-1" ng-required="s.required">';

            element += '</div>';
            element += '</td>';
            element += '<td ng-if="!onlyread" class="jstableform-button"><button type="button" class="uk-button uk-text-danger uk-width-1-1 uk-height-1-1" ng-click="removeItem($index)"><i class="uk-icon-trash uk-icon-small"></i></button></td>';
            element += '</tr>';

            //creating input
            element += '<tr ng-if="!onlyread">';

            element += '<td data-ng-repeat="h in structure">';

            element += '<div ng-switch="h.type">';

            element += '<span ng-switch-when="array"></span>';
            element += '<span ng-switch-when="sequence">#</span>';

            element += '<div ng-switch-when="select">';
            element += '<select ng-if="h.select.label"  name="{{h.property}}" data-ng-model="newItem[h.property]" class="uk-width-1-1" ng-options="opt[h.select.label] for opt in h.select.options track by opt[h.select.id]" ng-required="h.required" />';
            element += '<select ng-if="!h.select.label" name="{{h.property}}" data-ng-model="newItem[h.property]" class="uk-width-1-1" ng-options="opt for opt in h.select.options" ng-required="h.required" />';
            element += '</div>';

            element += '<div ng-switch-when="autocomplete" class="uk-autocomplete uk-form uk-width-1-1"><input name="{{h.property}}" type="text" placeholder="{{h.placeholder?h.placeholder:\'\'}}" class="uk-width-1-1" ng-model="newItem[h.property]"  data-uk-source-path="h.autocomplete.sourcePath"  data-uk-source="h.autocomplete.source" data-uk-label="h.autocomplete.label" uk-ng-autocomplete ng-required="h.required"></div>';
            element += '<input name="{{h.property}}" ng-switch-when="number" data-ng-model="newItem[h.property]" type="number" class="uk-width-1-1" data-ng-max="{{h.number.max}}" data-ng-min="{{h.number.min}}" ng-required="h.required">';
            element += '<input name="{{h.property}}" ng-switch-default data-ng-model="newItem[h.property]" type="{{h.type}}" placeholder="{{h.placeholder?h.placeholder:\'\'}}" class="uk-width-1-1" ng-required="h.required">';

            element += '</div>';
            element += '</td>';

            element += '<td class="jstableform-button uk-width-1-1 uk-height-1-1"><button  ng-class="{\'uk-text-success\': newItemForm.$valid}" type="submit" class="uk-button" data-ng-disabled="newItemForm.$invalid"><i class="uk-icon-plus uk-icon-small"></i></button></td>';
            element += '</tr>';
            //-----------------------

            element += '</tbody>';
            element += '</table></fieldset></form>';
            return element;
        }
    }