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
                    if(scope.model.id || scope.model.name){
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

            scope.getHeaders = function(struct) {
                var firstRow = [];
                var secondRow = [];
                var countNotArray = function(array) {
                    return array.filter(function(el) {
                        return el.type != 'array';
                    }).length;
                };
                var first = true;
                var recur = function(arr){
                    arr.forEach(function(s) {
                        if (s.type != 'array') {
                            if (first) {
                                firstRow.push({colspan:1});
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
                return {firstRow: firstRow, secondRow: secondRow};
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
        element += '<div ng-switch-when="autocomplete">{{m[s.property][s.autocomplete.label]?m[s.property][s.autocomplete.label]:m[s.property]}}</div>';
        element += '<div ng-switch-when="select">{{m[s.property][s.select.label]}}</div>';
        element += '<div ng-switch-when="sequence" ng-init="m.sequence = row.index">{{m.sequence}}</div>';
        element += '<div ng-switch-default>{{m[s.property]}}</div>';

        element += '</div>';
        element += '</td>';
        element += '<td ng-if="!onlyread" style="padding:0 0 1px 0"><button type="button" class="uk-button uk-text-danger uk-width-1-1 uk-height-1-1" ng-click="removeItem($index)"><i class="uk-icon-trash uk-icon-small"></i></button></td>';
        element += '</tr>';

        //creating input
        element += '<tr ng-if="!onlyread">';

        element += '<td data-ng-repeat="h in structure">';

        element += '<div ng-switch="h.type">';

        element += '<span ng-switch-when="array"></span>';
        element += '<span ng-switch-when="sequence">#</span>';
        element += '<select name="{{h.property}}" ng-switch-when="select" data-ng-model="newItem[h.property]" class="uk-width-1-1" ng-options="opt[h.select.label] for opt in h.select.options track by opt[h.select.id]" required />';
        element += '<div ng-switch-when="autocomplete" class="uk-autocomplete uk-form uk-width-1-1"><input name="{{h.property}}" type="text" placeholder="{{h.placeholder?h.placeholder:\'\'}}" class="uk-width-1-1" ng-model="newItem[h.property]" data-uk-source="h.autocomplete.source" data-uk-label="h.autocomplete.label" uk-ng-autocomplete required></div>';
        element += '<input name="{{h.property}}" ng-switch-when="number" data-ng-model="newItem[h.property]" type="number" class="uk-width-1-1" data-ng-max="{{h.number.max}}" data-ng-min="{{h.number.min}}" required>';
        element += '<input name="{{h.property}}" ng-switch-default data-ng-model="newItem[h.property]" type="{{h.type}}" placeholder="{{h.placeholder?h.placeholder:\'\'}}" class="uk-width-1-1" ng-required="h.required">';

        element += '</div>';
        element += '</td>';

        element += '<td><button  ng-class="{\'uk-text-success\': newItemForm.$valid}" type="submit" class="uk-button" style="width:80px" data-ng-disabled="newItemForm.$invalid"><i class="uk-icon-plus uk-icon-small"></i></button></td>';
        element += '</tr>';
        //-----------------------

        element += '</tbody>';
        element += '</table></fieldset></form>';
        return element;
    }
}).directive('ukNgCalendar', function () {
    return {
        restrict: "EA",
        scope: {
            date: "=?",
            getEventsByDate: "=?"
        },
        template: "<div class=\"uk-grid uk-grid-collapse calendar\"><div class=\"uk-width-1-1 calendar-nav\"><a href=\"\" class=\"uk-icon-hover uk-icon-chevron-left\" ng-click=\"addMonth(-1)\"></a>        <div class=\"uk-form-select\" data-uk-form-select=\"{target:'a'}\">            <a>{{monthSelected}}</a>            <select ng-model=\"monthSelected\" ng-change=\"changeDate()\">                <option data-ng-repeat=\"m in months\" ng-value=\"m\">{{m}}</option>            </select>        </div>        <div class=\"uk-form-select\" data-uk-form-select=\"{target:'a'}\">            <a>{{yearSelected}}</a>            <select ng-model=\"yearSelected\" ng-change=\"changeDate()\">                <option data-ng-repeat=\"y in years | orderBy\" ng-value=\"y\">{{y}}</option>            </select>        </div>        <a href=\"\" class=\"uk-icon-hover uk-icon-chevron-right\" ng-click=\"addMonth(1)\"></a>    </div>    <div class=\"uk-width-1-1 calendar-header\">        <div class=\"uk-grid uk-grid-collapse calendar-header\">            <div class=\"uk-width calendar-header-day\" style=\"width: calc(100%/7)\"                 data-ng-repeat=\"d in ['Lun','Mar','Mer','Gio','Ven','Sab','Dom']\">                <div class=\"uk-panel uk-panel-box\">                    <h3 class=\"uk-panel-title\">{{d}}</h3>                </div>            </div>        </div>    </div>    <div class=\"uk-width-1-1 calendar-body\">        <div class=\"uk-grid uk-grid-collapse\" data-ng-repeat=\"w in month.weeks\" data-uk-grid-match=\"{target:'.uk-panel'}\">            <div class=\"uk-width calendar-day\" style=\"width: calc(100%/7)\" data-ng-repeat=\"d in w\" ng-click=\"toggleDay(d)\">                <div class=\"uk-panel uk-panel-box uk-panel-hover\" ng-class=\"{'active':d.isSelected}\">                    <h3 class=\"uk-panel-title\" ng-class=\"{'calendar-different-month-day':d.differentMonth}\"><i class=\"uk-icon-calendar\"></i> {{d.number}}</h3>                    <div class=\"uk-badge\" data-ng-repeat=\"e in d.events\">{{e.content}}</div>                </div>            </div>        </div>        <!--<div data-ng-repeat-end class=\"uk-block calendar-day-detail\" ng-if=\"hasDaySelected(w)\">-->            <!--Dettaglio-->        <!--</div>-->    </div></div>",
        link: function (scope, element, attrs) {

            scope.hasDaySelected = function(w) {
                if (!w) return false;
                for (var i = 0; i<w.length; i++) {
                    var el = w[i];
                    if (el.isSelected) return true;
                }
                return false;
            };

            scope.toggleDay = function(day) {
                day.isSelected = !day.isSelected;
                scope.month.weeks.forEach(function(w) {
                    w.forEach(function(d) {
                        if (day.date !== d.date) {
                            d.isSelected = false;
                        }
                    });
                });
            };

            scope.changeDate = function() {
                scope.date = new Date(Date.UTC(scope.yearSelected, scope.months.indexOf(scope.monthSelected), 1));
            };

            scope.addMonth = function(num) {

                var futureMonth = scope.date.getUTCMonth() + num;

                //11 is december
                if (futureMonth > 11) {
                    scope.date = new Date(Date.UTC(scope.date.getUTCFullYear() + 1, 0, 1));
                } else if (futureMonth < 0) {
                    scope.date = new Date(Date.UTC(scope.date.getUTCFullYear() - 1, 11, 1));
                } else {
                    scope.date = new Date(Date.UTC(scope.date.getUTCFullYear(), futureMonth, 1));
                }

            };


            scope.$watch("date", function() {

                if (!scope.date) {
                    scope.date = new Date();
                }

                var date = angular.copy(scope.date);


                scope.years = [2014,2015,2016,2017];
                scope.months = ["Genuary", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

                scope.yearSelected = date.getUTCFullYear();
                scope.monthSelected = scope.months[date.getUTCMonth()];


                date.setUTCHours(0);
                date.setUTCMinutes(0);
                date.setUTCSeconds(0);
                date.setUTCMilliseconds(0);

                var today = new Date();
                today.setUTCHours(0);
                today.setUTCMinutes(0);
                today.setUTCSeconds(0);
                today.setUTCMilliseconds(0);

                var startDate = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), 1));

                while(startDate.getUTCDay() != 1) {
                    startDate = new Date(startDate.getTime() - 24*60*60*1000);
                }

                var tmpDay = startDate;

                var month = {
                    weeks: []
                };


                var generateMonth = function(tmpDay, eventMap) {
                    var week = 0;
                    for(var i = 0; i<42; i++) {

                        if (tmpDay.getUTCDay() == 1) {
                            week++;
                        }

                        var jsonDay = {
                            number: tmpDay.getUTCDate(),
                            isToday: tmpDay.getTime() === today.getTime(),
                            date: tmpDay,
                            differentMonth: tmpDay.getUTCMonth() !== date.getUTCMonth(),
                            events: eventMap[tmpDay]
                        };
                        if (!month.weeks[week]) {
                            month.weeks[week] = [];
                        }
                        month.weeks[week].push(jsonDay);
                        tmpDay = new Date(tmpDay.getTime() + 24*60*60*1000);
                    }

                    scope.month = month;
                };

                if (!scope.getEventsByDate) {
                    generateMonth(tmpDay, []);
                } else {
                    scope.getEventsByDate().then(function(events) {
                        var eventMap = {};
                        events.forEach(function(e) {
                            var tmpDay = e.startDate;
                            while(tmpDay <= e.endDate) {
                                if (!eventMap[tmpDay]) {
                                    eventMap[tmpDay] = [];
                                }
                                eventMap[tmpDay].push(e);
                                tmpDay = new Date(tmpDay.getTime() + 24*60*60*1000);
                            }
                        });

                        generateMonth(tmpDay, eventMap);
                    }, function(error) {
                        console.log(error);
                    })
                }


            });


        }
    }
});