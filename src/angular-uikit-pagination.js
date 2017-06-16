export default function ukNgPagination() {
    return {
        restrict: 'AE',
        scope: {
            listSize: '=',
            pageSize: '=',
            currentPage: '=?',
            onPageChange: '&'
        },
        link: function (scope, element, attrs) {
            var ukPaginationOptions = {
                items: scope.listSize,
                itemsOnPage: scope.pageSize,
                currentPage: scope.currentPage ? scope.currentPage : 0,
                displayedPages: 3,
                edges: 1
            };

            var pagination = UIkit.pagination(element, ukPaginationOptions);
            window.pag = pagination;

            element.on('select.uk.pagination', function (e, pageIndex) {
                scope.onPageChange({$page: pageIndex});
            });

            scope.$watch('scope.listSize', function () {
                pagination.options.items = scope.listSize;
                pagination.pages = Math.ceil(scope.listSize / scope.pageSize);
                pagination.render();
            });

            scope.$watch('scope.pageSize', function () {
                pagination.options.itemsOnPage = scope.pageSize;
                pagination.pages = Math.ceil(scope.listSize / scope.pageSize);
                pagination.render();
            });
        }
    };
}