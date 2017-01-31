export default function ukNgSortableItem() {
    return {
        restrict: 'A',
        scope: {
            item: '=ukNgSortableItem'
        },
        require: "^^ukNgSortable",
        link: function (scope, element, attrs, ctrl) {
            ctrl.addItem(element, scope.item);
        }
    }
}