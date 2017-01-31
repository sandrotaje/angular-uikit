export default function ukNgNotAllowArrayDuplicate() {
    return {
        restrict: "A",
        require: "ngModel",
        scope: {
            ukNgNotAllowArrayDuplicate: "=?",
            callbackUrl: "&?" //TODO
        },
        link: function (scope, element, attrs, ngModelController) {
            ngModelController.$parsers.unshift(function (value) {
                if (ngModelController.$modelValue !== value) {
                    var valid = !scope.ukNgNotAllowArrayDuplicate.source.some(function (elem) {
                        var existingValue = elem[scope.ukNgNotAllowArrayDuplicate.attribute];
                        if (existingValue && value)
                            return existingValue.toUpperCase() === value.toUpperCase();
                        return false;
                    });

                    ngModelController.$setValidity('duplicate', valid);
                    return valid ? value : undefined;
                }
            });

            ngModelController.$formatters.unshift(function (value) {
                ngModelController.$setValidity('duplicate', !scope.ukNgNotAllowArrayDuplicate.source.some(function (elem) {
                    var existingValue = elem[scope.ukNgNotAllowArrayDuplicate.attribute];
                    if (existingValue && value)
                        return existingValue.toUpperCase() === value.toUpperCase();
                    return false;
                }));
                return value;
            });
        }
    };
}