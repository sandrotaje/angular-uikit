angular.module('angularUikit', [])
    .directive('ukAutocomplete', function ($http, $timeout) {
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
                    ngModel.$setViewValue({
                        id: scope.model.id,
                        value: scope.model.value
                    });
                });

                ngModel.$formatters = [(function (value) {
                    return value;
                })];

                ngModel.$parsers.unshift(function (value) {
                    if (value instanceof Object) {
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
    .directive('ukPagination', function () {
        return {
            restrict: 'AE',
            scope: {
                listSize: '=',
                pageSize: '=',
                onPageChange: '='
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
                    scope.onPageChange(pageIndex);
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
    }).directive('ukJsonTableForm', function ($compile) {
    return {
        restrict: "EA",
        scope: {
            model: "=",
            structure: "="
        },
        link: function (scope, element, attrs) {
            if (!scope.model) {
                scope.model = [];
            }
            var table = generateTable(scope.model, scope.structure, "first");
            element.append($compile(angular.element(table))(scope));
            //scope.$apply();

            scope.addItem = function () {
                scope.model.push(angular.copy(scope.newItem));
                scope.newItem = {};
            };

            scope.removeItem = function removeItem(index) {
                scope.model.splice(index, 1);
            };

            scope.generateTable = generateTable;

        }
    };

    function generateTable(model, structure, name) {
        var element = '<form name="newItemForm" class="uk-form uk-form-stacked" novalidate><fieldset><table class="uk-table uk-table-striped">';

        //creating header
        element += '<thead><tr>';
        element += '<th data-ng-repeat="h in structure"><span ng-hide="h.type==\'array\' && model.length<=0">{{h.label}}</span></th>';
        element += '<th></th></tr></thead>';

        //---------------------

        element += '<tbody>';
        //creating input
        element += '<tr>';

        structure.forEach(function (el) {
            if (el.type != "array") {
                element += '<td><input data-ng-model="newItem.' + el.property + '" type="' + el.type + '" class="uk-width-1-1" placeholder="" title="" required></td>';
            } else {
                element += '<td></td>';
            }
        });
        element += '<td><button class="uk-button uk-button-primary uk-button-small uk-float-right" ng-disabled="newItemForm.$invalid" ng-click="addItem()">{{"ADD" | translate}}</button></td>';
        element += '</tr>';
        //-----------------------


        element += '<tr data-ng-repeat="m in model track by $index">';
        element += '<td class="uk-table-middle" data-ng-repeat="s in structure">';
        element += '<div ng-if="s.type!=\'array\'">{{m[s.property]}}</div>';
        element += '<div ng-if="s.type==\'array\'" uk-json-table-form data-model="m[s.property]" structure="s.items"></div>';
        element += '</td>';
        element += '<td class="uk-table-middle"><div class="uk-float-right"><button type="button" ng-click="removeItem($index)" class="uk-button uk-button-danger uk-button-small"><i class="uk-icon-trash"></i></button></div></td>';
        element += '</tr>';


        element += '</tbody>';
        element += '</table></fieldset></form>';
        return element;
    }
});