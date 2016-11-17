angular.module('angularUikit', [])
    .directive('ukNgAutocomplete', function ($http, $timeout) {
        return {
            restrict: 'A',
            require: 'ngModel',
            scope: {
                ukSource: '=',
                ukLabel: '=',
                ukTemplate: '=',
                ukOnSelect: '&'
            },
            link: function (scope, elem, attrs, ngModel) {

                var resultsTemplate = scope.ukTemplate ? scope.ukTemplate : '<ul class="uk-nav uk-nav-autocomplete uk-autocomplete-results">{{~items}}<li data-id="{{$item.id}}" data-value="{{$item.value}}"><a>{{$item.value}}</a></li>{{/items}}</ul>';

                var source = [];
                if (scope.ukSource)
                    scope.ukSource.forEach(function (element, index) {
                        var label;
                        if (scope.ukLabel && element.hasOwnProperty(scope.ukLabel))
                            label = element[scope.ukLabel];
                        else if (typeof element === 'string' || element instanceof String)
                            label = element;
                        else label = 'Label missing!';

                        source.push({id: index, value: label});
                    });
                else source.push({id: undefined, value: 'No source detected!'});

                var autocomplete = UIkit.autocomplete(elem.parent(), {
                    source: source,
                    minLength: 1,
                    delay: 0,
                    template: resultsTemplate
                });

                scope.model = {};

                ngModel.$render = function () {
                    var viewValue = ngModel.$viewValue;
                    if (viewValue) {
                        elem.val(viewValue.value);

                        scope.model.id = viewValue.id;
                        scope.model.value = viewValue.value;

                    } else {
                        scope.model = {};
                        elem.val('')
                    }
                };

                scope.$watch('model.id + model.name', function () {
                    if(scope.model.id){
                        ngModel.$setViewValue({
                            id: scope.model.id,
                            value: scope.model.value
                        });
                    }
                });

                ngModel.$formatters = [(function (value) {
                    return value;
                })];

                ngModel.$parsers.unshift(function (value) {
                    if (value instanceof Object && value.id) {
                        return scope.ukSource[value.id];
                    }
                    return undefined;
                });

                elem.off('change');

                autocomplete.on('selectitem.uk.autocomplete', function (event, ui, obj) {
                    if (ui) {
                        ngModel.$setViewValue({
                            id: ui.id,
                            value: ui.value
                        });
                        if (scope.ukOnSelect) {
                            $timeout(function () {
                                scope.ukOnSelect({$selectedItem: scope.ukSource[ui.id]})
                            });
                        }
                    }

                });

                elem.on('blur', function () {
                    if (!ngModel.$modelValue) {
                        elem.val('');
                        ngModel.$setViewValue(undefined);
                    }
                });
            }
        }
    })
    .directive('ukNgPagination', function () {
        return {
            restrict: 'AE',
            scope: {
                listSize: '=',
                pageSize: '=',
                onPageChange: '&'
            },
            link: function (scope, element, attrs) {
                var ukPaginationOptions = {
                    items: scope.listSize,
                    itemsOnPage: scope.pageSize,
                    currentPage: 0,
                    displayedPages: 3,
                    edges: 1
                };

                var pagination = UIkit.pagination(element, ukPaginationOptions);
                window.pag = pagination;

                element.on('select.uk.pagination', function (e, pageIndex) {
                    scope.onPageChange({$page: pageIndex});
                });

                scope.$watch('listSize', function () {
                    pagination.options.items = scope.listSize;
                    pagination.pages = Math.ceil(scope.listSize / scope.pageSize);
                    pagination.render();
                });

                scope.$watch('pageSize', function () {
                    pagination.options.itemsOnPage = scope.pageSize;
                    pagination.pages = Math.ceil(scope.listSize / scope.pageSize);
                    pagination.render();
                });
            }
        };
    }).directive('ukNgJsonTableForm', function ($compile, $timeout) {
    return {
        restrict: "EA",
        scope: {
            model: "=",
            structure: "="
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

            scope.generateTable = generateTable;

        }
    };

    function generateTable(model, structure) {
        var element = '<form name="newItemForm" class="uk-form uk-form-stacked" ng-submit="addItem()" novalidate><fieldset><table ng-init="table.hasChild = false" class="uk-table uk-ng-table-form">';

        //creating header
        element += '<thead><tr>';
        element += '<th data-ng-repeat="h in structure">';
        element += '<div ng-switch="h.type">';
        element += '<div ng-switch-when="array" ng-init="table.hasChild = true"></div>';
        element += '<span ng-switch-default><i ng-if="h.icon" class="uk-icon-{{h.icon}}"></i> {{h.label}}</span>';
        element += '</div>';
        element += '</th>';
        element += '<th></th>';
        element += '</tr></thead>';

        //---------------------

        element += '<tbody>';

        element += '<tr class="uk-table-middle" data-ng-repeat="m in model track by $index" ng-init="row.index=$index+1">';
        element += '<td data-ng-repeat="s in structure">';
        element += '<div ng-switch="s.type">';


        element += '<div ng-switch-when="array" class="uk-accordion" data-uk-accordion="{showfirst: false, collapse: false, toggle: \'.uk-accordion-title-{{s.property}}\', containers:\'.uk-accordion-content-{{s.property}}\'}">';
        element += '<a ng-init="accordion.show = false" ng-click="accordion.show=!accordion.show" class="uk-width-1-1 uk-button uk-button-primary uk-button-large uk-accordion-title-{{s.property}}"><span class="uk-float-left"><i ng-if="s.icon" class="uk-icon-{{s.icon}}"></i> {{m[s.property].length}} {{s.label}} </span> <span class="uk-float-right"><i ng-hide="accordion.show" class="uk-icon-caret-right"></i><i ng-show="accordion.show" class="uk-icon-caret-down"></i></span></a>';
        element += '<div class="uk-accordion-content-{{s.property}}">';
        element += '<div data-uk-ng-json-table-form data-model="m[s.property]" data-structure="s.items"></div>';
        element += '</div></div>';
        element += '<div ng-switch-when="autocomplete">{{m[s.property][s.autocomplete.label]?m[s.property][s.autocomplete.label]:m[s.property]}}</div>';
        element += '<div ng-switch-when="select">{{m[s.property][s.select.label]}}</div>';
        element += '<div ng-switch-when="sequence" ng-init="m.sequence = row.index">{{m.sequence}}</div>';
        element += '<div ng-switch-default>{{m[s.property]}}</div>';

        element += '</div>';
        element += '</td>';
        element += '<td style="padding:0 0 1px 0"><button type="button" class="uk-button uk-text-danger uk-width-1-1 uk-height-1-1" ng-click="removeItem($index)"><i class="uk-icon-trash uk-icon-small"></i></button></td>';
        element += '</tr>';

        //creating input
        element += '<tr>';

        element += '<td data-ng-repeat="h in structure">';

        element += '<div ng-switch="h.type">';

        element += '<span ng-switch-when="array"><button type="submit" style="width:80px" ng-class="{\'uk-text-success\': newItemForm.$valid}" class="uk-button uk-float-left" data-ng-disabled="newItemForm.$invalid"><i class="uk-icon-plus uk-icon-small"></i></button></span>';
        element += '<span ng-switch-when="sequence">#</span>';
        element += '<select name="{{h.property}}" ng-switch-when="select" data-ng-model="newItem[h.property]" class="uk-width-1-1" ng-options="opt[h.select.label] for opt in h.select.options track by opt[h.select.id]" required />';
        element += '<div ng-switch-when="autocomplete" class="uk-autocomplete uk-form uk-width-1-1"><input name="{{h.property}}" type="text" placeholder="{{h.placeholder?h.placeholder:\'\'}}" class="uk-width-1-1" ng-model="newItem[h.property]" data-uk-source="h.autocomplete.source" data-uk-label="h.autocomplete.label" uk-ng-autocomplete required></div>';
        element += '<input name="{{h.property}}" ng-switch-when="number" data-ng-model="newItem[h.property]" type="number" class="uk-width-1-1" data-ng-max="{{h.number.max}}" data-ng-min="{{h.number.min}}" required>';
        element += '<input name="{{h.property}}" ng-switch-default data-ng-model="newItem[h.property]" type="{{h.type}}" placeholder="{{h.placeholder?h.placeholder:\'\'}}" class="uk-width-1-1" ng-required="h.required">';

        element += '</div>';
        element += '</td>';

        element += '<td><button ng-if="!table.hasChild" ng-class="{\'uk-text-success\': newItemForm.$valid}" type="submit" class="uk-button" style="width:80px" data-ng-disabled="newItemForm.$invalid"><i class="uk-icon-plus uk-icon-small"></i></button></td>';
        element += '</tr>';
        //-----------------------

        element += '</tbody>';
        element += '</table></fieldset></form>';
        return element;
    }
});