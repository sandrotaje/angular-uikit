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

            const ONE_DAY = 24 * 60 * 60 * 1000;
            const TODAY = new Date();
            //Set hours, minutes, seconds and millis to 0
            TODAY.setUTCHours(0, 0, 0, 0);

            //Use dates for locale translation
            //TODO: there must be a better way...
            scope.months = {
                0: new Date(1970, 0),
                1: new Date(1970, 1),
                2: new Date(1970, 2),
                3: new Date(1970, 3),
                4: new Date(1970, 4),
                5: new Date(1970, 5),
                6: new Date(1970, 6),
                7: new Date(1970, 7),
                8: new Date(1970, 8),
                9: new Date(1970, 9),
                10: new Date(1970, 10),
                11: new Date(1970, 11),
            };

            scope.days = {
                0: new Date(1970, 0, 5),
                1: new Date(1970, 0, 6),
                2: new Date(1970, 0, 7),
                3: new Date(1970, 0, 8),
                4: new Date(1970, 0, 9),
                5: new Date(1970, 0, 10),
                6: new Date(1970, 0, 11),
            };

            scope.years = [];
            for (let i = 2015; i < TODAY.getFullYear() + 5; i++) {
                scope.years.push(i);
            }

            scope.selection = {
                year: TODAY.getFullYear(),
                month: scope.months[TODAY.getMonth()]
            };

            scope.date = TODAY;
            generateCalendar();

            scope.changeDate = function () {
                scope.date = new Date(Date.UTC(scope.selection.year, scope.selection.month.getMonth(), 1));
                generateCalendar();
            };

            scope.addMonth = function (num) {
                scope.date.setUTCMonth(scope.date.getUTCMonth() + num)
                generateCalendar();

                scope.selection.year = scope.date.getUTCFullYear();
                scope.selection.month = scope.months[scope.date.getUTCMonth()];
            };

            scope.getDaysRemaining = function (numDays, day) {
                var dayRem = 7 - day;
                var num = numDays + 1;
                if (num > dayRem) {
                    return dayRem;
                }
                return num;
            };

            scope.selectEvent = function (e) {
                scope.onEventSelected && scope.onEventSelected({$event: e});
            };

            function generateCalendar() {
                scope.loading = true;
                //First get the first day of the month from selected date
                var previousMonday = new Date(Date.UTC(scope.date.getUTCFullYear(), scope.date.getUTCMonth(), 1));
                //Then retrieve the first occurrence of a monday previous of the first day of the month
                previousMonday.setUTCDate(previousMonday.getUTCDate() - (previousMonday.getUTCDay() + 6) % 7);

                if (!scope.getEventsByDate) {
                    generateMonth(previousMonday, []);
                } else {
                    scope.getEventsByDate({$startDate: previousMonday, $endDate: new Date(previousMonday.getTime() + 42 * ONE_DAY)}).then(function (events) {
                        var eventMap = {};
                        events.forEach(function (e) {

                            e.original = Object.assign({}, e);
                            e.startDate = angular.isDate(e.startDate) ? e.startDate : new Date(e.startDate);
                            e.endDate = angular.isDate(e.endDate) ? e.endDate : new Date(e.endDate);

                            var tmpDay = angular.copy(e.startDate);
                            e.numDays = Math.round((e.endDate.getTime() - e.startDate.getTime()) / ONE_DAY);
                            e.firstDay = true;
                            while (tmpDay.getTime() <= e.endDate.getTime()) {
                                let index = tmpDay.getUTCFullYear() + "" + tmpDay.getMonth() + "" + tmpDay.getDate();
                                if (!eventMap[index]) {
                                    eventMap[index] = [];
                                }
                                eventMap[index].push(angular.copy(e));
                                tmpDay.setUTCDate(tmpDay.getUTCDate() + 1);
                                e.firstDay = false;
                            }
                        });
                        generateMonth(previousMonday, eventMap);
                    }, function (error) {
                        console.log(error);
                    })
                }
            }

            function generateMonth(tmpDay, eventMap) {
                var month = {
                    weeks: []
                };
                var week = 0;
                for (let i = 0; i < 42; i++) {

                    if (tmpDay.getUTCDay() === 1) {
                        week++;
                    }

                    var jsonDay = {
                        number: tmpDay.getUTCDate(),
                        isToday: tmpDay.getTime() === TODAY.getTime(),
                        date: tmpDay,
                        differentMonth: tmpDay.getUTCMonth() !== scope.date.getUTCMonth(),
                        events: eventMap[tmpDay.getUTCFullYear() + "" + tmpDay.getMonth() + "" + tmpDay.getDate()]
                    };
                    if (!month.weeks[week]) {
                        month.weeks[week] = [];
                    }
                    month.weeks[week].push(jsonDay);
                    tmpDay.setUTCDate(tmpDay.getUTCDate() + 1);
                }

                scope.month = month;
                scope.loading = false;
            }
        }
    }
}