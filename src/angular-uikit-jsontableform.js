import "./angular-uikit-jsontableform.scss";
var templateUrl = require('ngtemplate-loader!html-loader!./angular-uikit-jsontableform.html');
var compactTemplateUrl = require('ngtemplate-loader!html-loader!./angular-uikit-jsontableform-compact.html');

ukNgJsonTableForm.$inject = ['$compile', '$timeout'];
export default function ukNgJsonTableForm($compile, $timeout) {
    return {
        restrict: "EA",
        scope: {
            model: "=",
            structure: "=",
            parent: "=",
            readOnly: "=?",
            canReorder: "=?",
            allHeaderInHead: "=?",
            noHeader: "=?",
            deleteConfirmLabel: "=?",
            submitOnEnter: "=?",
            compact: "=?",
            oddIteration: "=?"
        },
        transclude: {
            template: "?customTemplate",
            insertTemplate: "?customInsertTemplate"
        },
        templateUrl: function (elm, attrs) {
            return !attrs.compact || attrs.compact === 'false' ? templateUrl : compactTemplateUrl
        },
        link: function (scope, element, attrs, ctrl, $transcludeFn) {


            scope.transcludeTemplate = function (scp, elm) {
                $transcludeFn(scp, function (clone) {
                    elm.append(clone);
                }, null, 'template')
            };

            scope.transcludeInsertTemplate = function (scp, elm) {
                $transcludeFn(scp, function (clone) {
                    elm.append(clone);
                }, null, 'insertTemplate')
            };


            if (scope.compact) {
                if (scope.oddIteration == undefined)
                    scope.oddIteration = false;
                scope.arraysStructure = [];
                scope.valuesStructure = [];

                scope.structure.forEach(function (el) {
                    if (el.type != "array")
                        scope.valuesStructure.push(el);
                    else
                        scope.arraysStructure.push(el);
                });
            }

            scope.newItem = {};
            if (!scope.model) {
                scope.model = [];
            }

            scope.addItem = function () {
                scope.model.push(angular.copy(scope.newItem));
                scope.newItem = {};
            };

            
            scope.$watch('newItem', function () {
                for(let h of scope.structure){
                    if(h.default && scope.newItem && !scope.newItem[h.property]){
                        scope.newItem[h.property] = typeof h.default === "function"?h.default(scope.parent, scope.newItem):h.default;
                    }
                }
            }, true);

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
                        return el.type !== 'array';
                    }).length;
                };
                var first = true;
                var recur = function (arr) {
                    arr.forEach(function (s) {
                        if (s.type !== 'array') {
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