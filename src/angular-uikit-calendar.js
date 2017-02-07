var templateUrl = require('ngtemplate-loader!html-loader!./angular-uikit-calendar.html');
import './angular-uikit-calendar.scss';

export default function ukNgCalendar() {
        return {
            restrict: "EA",
            scope: {
                date: "=?",
                getEventsByDate: "&?",
                onEventSelected: "&?"
            },
            templateUrl: templateUrl,
            link: function (scope, element, attrs) {

                var ONE_DAY = 24 * 60 * 60 * 1000;

                scope.hasDaySelected = function (w) {
                    if (!w) return false;
                    for (var i = 0; i < w.length; i++) {
                        var el = w[i];
                        if (el.isSelected) return true;
                    }
                    return false;
                };

                scope.changeDate = function () {
                    scope.date = new Date(Date.UTC(scope.yearSelected, scope.months.indexOf(scope.monthSelected), 1));
                };

                scope.addMonth = function (num) {

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

                scope.getDaysRemaining = function(numDays, day) {
                    var dayRem = 7 - day;
                    var num = numDays + 1;
                    if (num > dayRem) {
                        return dayRem;
                    }
                    return num;
                }

                scope.selectEvent = function(e) {
                    scope.onEventSelected && scope.onEventSelected({$event: e});
                }

                scope.getStyle = function(style) {
                    var ngStyle = {};
                    if (style) {
                        if (style.color) {
                            ngStyle['color'] = style.color;
                        }
                        if (style.background) {
                            ngStyle['background'] = style.background;
                        }
                        return ngStyle;
                    }
                    return {};
                }


                scope.$watch("date", function () {

                    if (!scope.date) {
                        scope.date = new Date();
                    }

                    var date = angular.copy(scope.date);


                    scope.years = [2014, 2015, 2016, 2017];
                    scope.months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

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

                    while (startDate.getUTCDay() != 1) {
                        startDate = new Date(startDate.getTime() - ONE_DAY);
                    }

                    var tmpDay = new Date(startDate.getTime());

                    var month = {
                        weeks: []
                    };


                    var generateMonth = function (tmpDay, eventMap) {
                        var week = 0;
                        for (var i = 0; i < 42; i++) {

                            if (tmpDay.getUTCDay() == 1) {
                                week++;
                            }

                            var jsonDay = {
                                number: tmpDay.getUTCDate(),
                                isToday: tmpDay.getTime() === today.getTime(),
                                date: tmpDay,
                                differentMonth: tmpDay.getUTCMonth() !== date.getUTCMonth(),
                                events: eventMap[tmpDay.getUTCFullYear()+""+tmpDay.getUTCMonth()+""+tmpDay.getUTCDate()]
                            };
                            if (!month.weeks[week]) {
                                month.weeks[week] = [];
                            }
                            month.weeks[week].push(jsonDay);
                            tmpDay = new Date(tmpDay.getTime() + ONE_DAY);
                        }

                        scope.month = month;
                    };

                    if (!scope.getEventsByDate) {
                        generateMonth(tmpDay, []);
                    } else {
                        scope.getEventsByDate({$startDate: startDate, $endDate: new Date(startDate.getTime() + 42 * ONE_DAY)}).then(function (events) {
                            var eventMap = {};
                            var events = [...events];
                            events.forEach(function (e) {
                                e.original = Object.assign({}, e);
                                var tmpDay = e.startDate;
                                e.numDays = (e.endDate - e.startDate)/(1000*60*60*24);
                                e.firstDay = true;
                                while (tmpDay <= e.endDate) {
                                    if (!eventMap[tmpDay.getUTCFullYear()+""+tmpDay.getUTCMonth()+""+tmpDay.getUTCDate()]) {
                                        eventMap[tmpDay.getUTCFullYear()+""+tmpDay.getUTCMonth()+""+tmpDay.getUTCDate()] = [];
                                    }
                                    eventMap[tmpDay.getUTCFullYear()+""+tmpDay.getUTCMonth()+""+tmpDay.getUTCDate()].push(angular.copy(e));
                                    tmpDay = new Date(tmpDay.getTime() + 24 * 60 * 60 * 1000);
                                    e.firstDay = false;
                                }
                            });

                            generateMonth(tmpDay, eventMap);
                        }, function (error) {
                            console.log(error);
                        })
                    }


                });


            }
        }
    }