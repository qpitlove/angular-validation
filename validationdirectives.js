angular.module('validation', [])
    .directive('customValidator', [function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elm, attr, ngModelCtrl) {
            var validateFunctionNames = attr["validateFunctions"].split(",");
            var validatorNames = attr["customValidator"].split(",");
            ngModelCtrl.$parsers.push(function (value) {
                var hasErrors = false;
                angular.forEach(validateFunctionNames, function (functionName, index) {
                    if (!scope[functionName]) {
                        console.log('There is no function with name ' + functionName + ' available on the scope. Please make sure the function exists on current scope or its parent.');
                    } else {
                        var result = scope[functionName](value);
                        if (result && result != false) {
                            ngModelCtrl.$setValidity(validatorNames[index], true);
                        } else {
                            ngModelCtrl.$setValidity(validatorNames[index], false);
                            hasErrors = true;
                        }

                    }
                });
                return hasErrors ? undefined : value;
            });
        }
    };
}])
    .directive('customRemoteValidator', [function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, elm, attr, ngModelCtrl) {
            var validateFunctionNames = attr["remoteValidateFunctions"].split(",");
            var validatorNames = attr["customRemoteValidator"].split(",");
            ngModelCtrl.$parsers.push(function (value) {
                angular.forEach(validateFunctionNames, function (functionName, index) {
                    if (!scope[functionName]) {
                        console.log('There is no function with ' + functionName + ' available on the scope. Please make sure the function exists on current scope or its parent.');
                    } else {
                        var result = scope[functionName](value);
                        if (result.then) {
                            result.then(function (data) { //For promise type result object
                                ngModelCtrl.$setValidity(validatorNames[index], data);
                            }, function (error) {
                                ngModelCtrl.$setValidity(validatorNames[index], false);
                            });
                        }
                    }
                });
                return value;
            });
        }
    };
}])
    .directive('validationMessages', function () {
    return {
        scope: {
            modelController: '='
        },
        restrict: 'EA',
        link: function (scope, elm, attrs) {
            if (!scope.modelController) {
                console.log('Requires a html attribute data-model-controller. This should point to the input field model controller.');
            }
            scope.$watch('modelController.$error', function (newValue) {
                if (newValue) {
                    scope.errorMessages = [];
                    angular.forEach(newValue, function (value, key) {
                        if (value && attrs[key + 'Error']) {
                            scope.errorMessages.push(attrs[key + 'Error']);
                        }
                    });
                }
            }, true);
        },
        template: '<div><small class="error" ng-repeat="message in errorMessages" ng-show= "!modelController.$pristine && $first" class="warning">{{message}}</small></div>'
    }
})
    .directive('updateOnBlur', function () {
    return {
        restrict: 'A',
        require: 'ngModel',
        priority: '100',
        link: function (scope, elm, attr, ngModelCtrl) {
            if (attr.type === 'radio' || attr.type === 'checkbox') return;

            elm.unbind('input').unbind('keydown').unbind('change');
            elm.bind('blur', function () {
                scope.$apply(function () {
                    ngModelCtrl.$setViewValue(elm.val());
                });
            });
        }
    };
});