export default function ukNgSortable() {
    return {
        restrict: 'A',
        scope: {
            options: '=ukNgSortable'
        },
        controller: ["$scope", "$element", function ($scope, $element) {

            var ctrl = this;

            UIkit.sortable($element[0], $scope.options);
            $element.on('stop.uk.sortable', function (a, b, c, d) {
                $scope.$applyAsync(function () {
                    jQuery($element[0]).children().each(function (i, el) {
                        var found = ctrl.items.find(function (elem) {
                            return elem.element[0] === el;
                        });
                        found.item.order = i + 1;
                    });
                });
            });
            ctrl.items = [];

            ctrl.addItem = function (element, i) {
                ctrl.items.push({
                    element: element,
                    item: i
                });
            }
        }]
    }
}