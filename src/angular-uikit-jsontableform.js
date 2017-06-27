import "./angular-uikit-jsontableform.scss";
var templateUrl = require('ngtemplate-loader!html-loader!./angular-uikit-jsontableform.html');

ukNgJsonTableForm.$inject = ['$compile', '$timeout'];
export default function ukNgJsonTableForm($compile, $timeout) {
    return {
        restrict: "EA",
        scope: {
            model: "=",
            structure: "=",
            readOnly: "=?",
            canReorder: "=?",
            allHeaderInHead: "=?",
            deleteConfirmLabel: "=?",
            submitOnEnter: "=?"
        },
        templateUrl: templateUrl,
        link: function (scope, element, attrs) {
            scope.newItem = {};
            if (!scope.model) {
                scope.model = [];
            }
            
            scope.addItem = function () {
                scope.model.push(angular.copy(scope.newItem));
                scope.newItem = {};
            };

            scope.removeItem = function removeItem(index) {

                UIkit.modal.confirm(scope.deleteConfirmLabel || "Are you sure?", function () {
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
                                firstRow.push({colspan: 1});
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

            scope.objectify = function (el) {
                var newObj = {};
                if (angular.isArray(el)) {
                    el.forEach(e => {
                        newObj[e] = e;
                    });
                    return newObj;
                }
                return el;
            };

            scope.toggleIndexSelection = function (index) {
                if (scope.selectedIndex == index)
                    scope.selectedIndex = null;
                else
                    scope.selectedIndex = index;
            };

            scope.moveSelectedModelElementUp = function () {
                swapArrayElements(scope.model, scope.selectedIndex, --scope.selectedIndex);
            };

            scope.moveSelectedModelElementDown = function () {
                swapArrayElements(scope.model, scope.selectedIndex, ++scope.selectedIndex);
            };

            function swapArrayElements(array, from, to) {
                var temp = array[to];
                array[to] = array[from];
                array[from] = temp;
            }
        }
    };
}