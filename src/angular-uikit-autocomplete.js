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

            var source = scope.ukSourcePath ? callback : scope.ukSource ? populateSource(scope.ukSource) : [{id: undefined, value: 'No source detected!'}];

            var autocomplete = UIkit.autocomplete(elem.parent(), {
                source: source,
                minLength: 1,
                delay: 0,
                template: resultsTemplate
            });

            scope.$watch('ukSource', function () {
                autocomplete.options.source = source = scope.ukSourcePath ? callback : scope.ukSource ? populateSource(scope.ukSource) : [{id: undefined, value: 'No source detected!'}];
                //ngModel.$render();
            });

            function populateSource(objects) {
                let autocompleteRenderedObjects = [];
                objects.forEach(function (element, index) {
                    var label = (typeof element === 'string' || element instanceof String) ? element : element[scope.ukLabel] ? element[scope.ukLabel] : 'Label missing!';
                    autocompleteRenderedObjects.push({id: element.id ? element.id : index, value: label});
                });
                return autocompleteRenderedObjects;
            }

            function callback(release) {
                let search = {};
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
                        release([{id: undefined, value: 'Error retrieving data'}]);
                    }
                );
            }

            ngModel.$formatters = [(function (value) {
                let realValue = value && scope.ukLabel ? value[scope.ukLabel] : value;

                if (!angular.isArray(source) || source.some(e=>realValue == e.value))
                    return realValue;

                return undefined;
            })];

            ngModel.$parsers.unshift(function (viewValue) {
                    if (typeof viewValue !== 'string' && !(viewValue instanceof String))
                        return viewValue;

                    if (!angular.isArray(source)) { //if source is not an array it is a callback function
                        return {id: undefined, value: viewValue, [scope.ukLabel]: viewValue};
                    }

                    return source.find(e=>e.value == viewValue);

                },
                function (viewValue) {
                    if (!angular.isArray(scope.ukSource)) { //No source means callback function (init)
                        return viewValue;
                    }

                    return scope.ukSource.find(function (el) {
                        if (el.id)
                            return el.id == viewValue.id;

                        return el == viewValue.value || el[scope.ukLabel] == viewValue.value;
                    });
                });

            autocomplete.on('selectitem.uk.autocomplete', function (event, ui, obj) {
                if (ui) {
                    ngModel.$setViewValue(ui);
                    
                    if (scope.ukOnSelect) {
                        $timeout(function () {
                            var item = scope.ukSource.find(function (el) {
                                if (el.id)
                                    return el.id == ui.id;

                                return el == ui.value || el[scope.ukLabel] == ui.value;
                            });
                            scope.ukOnSelect({$selectedItem: item})
                        });
                    }
                }

            });
        }
    }
};