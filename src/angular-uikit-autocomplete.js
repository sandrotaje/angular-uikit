ukNgAutocomplete.$inject = ['$http', '$timeout'];
export default function ukNgAutocomplete($http, $timeout) {
    return {
        restrict: 'A',
        require: 'ngModel',
        scope: {
            ukSource: '=?',
            ukSourcePath: '=?',
            ukLabel: '=?',
            ukTemplate: '=?',
            ukOnSelect: '&'
        },
        link: function (scope, elem, attrs, ngModel) {

            var resultsTemplate = scope.ukTemplate ? scope.ukTemplate : '<ul class="uk-nav uk-nav-autocomplete uk-autocomplete-results">{{~items}}<li data-id="{{$item.id}}" data-value="{{$item.value}}"><a>{{$item.value}}</a></li>{{/items}}</ul>';

            var source = scope.ukSource ? populateSource(scope.ukSource) : scope.ukSourcePath ? callback : [{
                id: undefined,
                value: 'No source detected!'
            }];

            var autocomplete = UIkit.autocomplete(elem.parent(), {
                source: source,
                minLength: 1,
                delay: 0,
                template: resultsTemplate
            });

            scope.$watch('ukSource', function () {
                autocomplete.options.source = source = scope.ukSource ? populateSource(scope.ukSource) : scope.ukSourcePath ? callback : [{
                    id: undefined,
                    value: 'No source detected!'
                }];
                ngModel.$render();
            });


            scope.model = {};

            ngModel.$render = function () {
                var viewValue = ngModel.$viewValue;
                if (typeof viewValue === "string" || viewValue instanceof String) {
                    viewValue = source.find(s => s.value === viewValue);
                }
                if (viewValue) {
                    elem.val(viewValue.value);

                    scope.model.id = viewValue.id;
                    scope.model.value = viewValue.value;

                } else {
                    scope.model = {};
                    elem.val('')
                }
            };

            function callback(release) {
                var search = {};
                search[scope.ukLabel ? scope.ukLabel : "search"] = ngModel.$viewValue;
                $http({
                    method: "GET",
                    url: scope.ukSourcePath,
                    params: search
                }).then(
                    function (resp) {
                        scope.ukSource = resp.data;
                        release(populateSource(resp.data));
                    },
                    function () {
                        release([{ id: undefined, value: 'Error retrieving data' }]);
                    }
                    );
            }

            function populateSource(objects) {
                var autocompleteRenderedObjects = [];
                objects.forEach(function (element, index) {
                    var label = (typeof element === 'string' || element instanceof String) ? element : element[scope.ukLabel] ? element[scope.ukLabel] : 'Label missing!';
                    autocompleteRenderedObjects.push({ id: element.id ? element.id : index, value: label });
                });
                return autocompleteRenderedObjects;
            }

            scope.$watch('model.id + model.name', function () {
                if (scope.model.id || scope.model.name) {
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
                if (value instanceof Object) {
                    if (scope.ukSource && scope.ukSource[0].id) {
                        return scope.ukSource.find(function (element) {
                            return element.id == value.id;
                        });
                    }
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
                            scope.ukOnSelect({ $selectedItem: scope.ukSource[ui.id] })
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
};