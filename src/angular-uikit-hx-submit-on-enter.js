hxSubmitOnEnter.$inject = ['$timeout'];
export default function hxSubmitOnEnter($timeout) {
    return {
        restrict: 'A',
        require: 'form',
        scope: {
            hxSubmitOnEnter: "&",
            hxSubmitOnEnterAllowed: "=?"
        },
        link: function (scope, element, attrs, formController) {
            if (scope.hxSubmitOnEnterAllowed) {
                element.on("keydown keypress", function (event) {
                    if (event.which === 13 && formController.$valid) {
                        event.preventDefault();
                        $timeout(function () {
                            scope.hxSubmitOnEnter();
                        });
                    }
                });
                
            }
        }
    };
};