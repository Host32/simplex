(function () {
    'use strict';

    angular.module('app.home')
        .controller('HomeCtrl', ['$scope', function ($scope) {

            $scope.step = 1;

            $scope.initial = {
                decisionVars: 2,
                restrictions: 3,
                objective: 'max',
                iterationLimit: 5
            };

            function generateRestrictions(amount) {

                $scope.restrictions = [
                    {
                        value: 10,
                        condition: 'menor',
                        decisionVars: [
                            {
                                value: 1
                            }, {
                                value: 1
                            }, {
                                value: 1
                            }
                        ]
                    }, {
                        value: 12,
                        condition: 'menor',
                        decisionVars: [
                            {
                                value: 2
                            }, {
                                value: 1
                            }, {
                                value: 4
                            }
                        ]
                    }, {
                        value: 9,
                        condition: 'menor',
                        decisionVars: [
                            {
                                value: 1
                            }, {
                                value: 3
                            }, {
                                value: -1
                            }
                        ]
                    }
                ];
                return;


                var i, j;

                $scope.restrictions = [];

                if (!amount) {
                    return;
                }

                for (i = 0; i < amount; i += 1) {
                    $scope.restrictions.push({
                        decisionVars: []
                    });
                    for (j = 0; j < $scope.decisionVars.length; j += 1) {
                        $scope.restrictions[i].decisionVars.push({});
                    }
                }
            }

            $scope.$watch('initial.decisionVars', function (newValue, oldValue) {

                $scope.decisionVars = [
                    {
                        value: 1
                    }, {
                        value: 2
                    }, {
                        value: 3
                    }
                ];
                return;

                var i;

                $scope.decisionVars = [];

                for (i = 0; i < newValue; i += 1) {
                    $scope.decisionVars.push({});
                }

                generateRestrictions($scope.initial.restrictions);
            });

            $scope.$watch('initial.restrictions', function (newValue, oldValue) {
                generateRestrictions(newValue);
            });

            function objectiveComparator(i) {
                return $scope.initial.objective === 'max' ? i < 0 : i > 0;
            }

            function testContinue(tabela) {
                var i;

                for (i = 1; i < tabela[0].length - 1; i += 1) {
                    if (objectiveComparator(tabela[0][i])) {
                        return true;
                    }
                }
                return false;
            }

            function enterVariable(tabela) {
                var max = 0,
                    abs,
                    maxIndex,
                    i;
                for (i = 1; i < tabela[0].length - 1; i += 1) {
                    abs = Math.abs(tabela[0][i]);
                    if (objectiveComparator(tabela[0][i]) && abs > max) {
                        max = abs;
                        maxIndex = i;
                    }
                }

                return maxIndex;
            }

            function exitVariable(tabela, enterVar) {
                var i,
                    min = Number.MAX_VALUE,
                    minIndex,
                    div;

                for (i = 1; i < tabela.length; i += 1) {
                    div = tabela[i][tabela[i].length - 1] / tabela[i][enterVar];
                    if (div > 0 && div < min) {
                        min = div;
                        minIndex = i;
                    }
                }
                return minIndex;
            }

            $scope.calculateSimplex = function () {

                // construcao da tabela
                var tabela = [],
                    linha,
                    coluna,
                    i,
                    j;

                tabela[0] = [1];

                var dVarsLimit = $scope.decisionVars.length + 1;
                var restLimit = dVarsLimit + $scope.restrictions.length;

                for (coluna = 1; coluna < dVarsLimit; coluna += 1) {
                    tabela[0][coluna] = -$scope.decisionVars[coluna - 1].value;
                }

                for (; coluna < restLimit; coluna += 1) {
                    tabela[0][coluna] = 0;
                }
                tabela[0][coluna] = 0;

                var restLength = $scope.restrictions.length;
                for (linha = 1; linha <= restLength; linha += 1) {
                    tabela[linha] = [0];

                    for (coluna = 1; coluna < dVarsLimit; coluna += 1) {
                        tabela[linha][coluna] = $scope.restrictions[linha - 1].decisionVars[coluna - 1].value;
                    }
                    for (; coluna < restLimit; coluna += 1) {
                        tabela[linha][coluna] = linha === (coluna - dVarsLimit + 1) ? ($scope.restrictions[linha - 1].condition === 'menor' ? 1 : -1) : 0;
                    }
                    tabela[linha][coluna] = $scope.restrictions[linha - 1].value;
                }

                var base = [];
                for (i = dVarsLimit; i < restLimit; i += 1) {
                    base.push(i);
                }

                $scope.steps = [];

                var continua = testContinue(tabela);

                $scope.steps.push({
                    base: angular.copy(base),
                    tabela: angular.copy(tabela),
                    continua: continua
                });

                var iteration = 0;
                while (continua && iteration < $scope.initial.iterationLimit) {
                    var enterVar = enterVariable(tabela);
                    var exitVar = exitVariable(tabela, enterVar);

                    // transformacoes lineares
                    var pivo = tabela[exitVar][enterVar];
                    tabela[exitVar] = tabela[exitVar].map(function (elem) {
                        return elem / pivo;
                    });

                    for (i = 0; i < tabela.length; i += 1) {
                        if (i !== exitVar) {

                            var mul = tabela[i][enterVar];
                            for (j = 0; j < tabela[i].length; j += 1) {
                                tabela[i][j] = tabela[i][j] - mul * tabela[exitVar][j];
                            }
                        }
                    }

                    continua = testContinue(tabela);

                    var exitVarCorrect = base[exitVar - 1];

                    // atualiza a base
                    base[exitVar - 1] = enterVar;

                    iteration++;

                    $scope.steps.push({
                        enterVar: enterVar,
                        exitVar: exitVarCorrect,
                        base: angular.copy(base),
                        tabela: angular.copy(tabela),
                        continua: continua,
                        iteration: iteration,
                        limit: iteration >= $scope.initial.iterationLimit
                    });
                }

                var basicas = [];
                var notBasicas = [];

                for (i = 1; i < tabela[0].length - 1; i += 1) {
                    var indexI = base.indexOf(i);
                    if (indexI !== -1) {
                        basicas.push({
                            var: i,
                            value: tabela[indexI + 1][tabela[indexI].length - 1]
                        });
                    } else {
                        notBasicas.push(i);
                    }
                }

                var reducedCost = [];
                for (i = 1; i < dVarsLimit; i += 1) {
                    reducedCost.push({
                        var: i,
                        value: -tabela[0][i]
                    });
                }

                var shadowPrice = [];
                for (i = dVarsLimit; i < restLimit; i += 1) {
                    shadowPrice.push({
                        var: i,
                        value: tabela[0][i]
                    });
                }

                $scope.otimo = {
                    base: angular.copy(base),
                    tabela: angular.copy(tabela),
                    basicas: basicas,
                    notBasicas: notBasicas,
                    shadowPrice: shadowPrice,
                    reducedCost: reducedCost
                };

                $scope.initial.locked = true;
                $scope.showResult = true;
            };

            setTimeout(function () {
                $scope.$apply(function () {
                    $scope.calculateSimplex();
                });
            }, 1000);

        }]);
}());
