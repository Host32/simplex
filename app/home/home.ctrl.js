(function () {
    'use strict';

    angular.module('app.home')
        .controller('HomeCtrl', ['$scope', function ($scope) {

            $scope.step = 1;

            $scope.initial = {
                decisionVars: 2,
                restrictions: 2,
                objective: 'max',
                iterationLimit: 10
            };

            function generateRestrictions(amount) {

                //                $scope.restrictions = [
                //                    {
                //                        value: 240,
                //                        condition: 'menor',
                //                        decisionVars: [
                //                            {
                //                                value: 2
                //                            }, {
                //                                value: 3
                //                            }, {
                //                                value: 4
                //                            }
                //                        ]
                //                    }, {
                //                        value: 150,
                //                        condition: 'menor',
                //                        decisionVars: [
                //                            {
                //                                value: 2
                //                            }, {
                //                                value: 1
                //                            }, {
                //                                value: 1
                //                            }
                //                        ]
                //                    }, {
                //                        value: 80,
                //                        condition: 'menor',
                //                        decisionVars: [
                //                            {
                //                                value: 1
                //                            }, {
                //                                value: 0
                //                            }, {
                //                                value: 0
                //                            }
                //                        ]
                //                    }
                //                ];
                //                return;


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

                //                $scope.decisionVars = [
                //                    {
                //                        value: 5
                //                    }, {
                //                        value: 7
                //                    }, {
                //                        value: 3
                //                    }
                //                ];
                //                return;

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

            function objectiveComparator(i, forcedType) {
                forcedType = forcedType || $scope.initial.objective
                return forcedType === 'max' ? i < 0 : i > 0;
            }

            function testContinue(tabela, forcedType) {
                var i;

                for (i = 1; i < tabela[0].length - 1; i += 1) {
                    if (objectiveComparator(tabela[0][i], forcedType)) {
                        return true;
                    }
                }
                return false;
            }

            function enterVariable(tabela, forcedType) {
                var max = 0,
                    abs,
                    maxIndex,
                    i;
                for (i = 1; i < tabela[0].length - 1; i += 1) {
                    abs = Math.abs(tabela[0][i]);
                    if (objectiveComparator(tabela[0][i], forcedType) && abs > max) {
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

            function createTable(dVarsLimit, restLimit) {
                var tabela = [[1]],
                    linha,
                    coluna;

                var restLength = $scope.restrictions.length;
                for (linha = 1; linha <= restLength; linha += 1) {
                    tabela[linha] = [0];

                    for (coluna = 1; coluna < dVarsLimit; coluna += 1) {
                        tabela[linha][coluna] = $scope.restrictions[linha - 1].decisionVars[coluna - 1].value;
                    }
                    for (coluna; coluna < restLimit; coluna += 1) {
                        tabela[linha][coluna] = 0;
                    }
                    tabela[linha][coluna] = $scope.restrictions[linha - 1].value;
                }

                for (linha = 1; linha <= restLength; linha += 1) {
                    for (coluna = dVarsLimit; coluna < restLimit; coluna += 1) {
                        if ($scope.restrictions[linha - 1].condition === 'igual') {
                            linha += 1;
                            coluna -= 1;
                        } else {
                            tabela[linha][coluna] = $scope.restrictions[linha - 1].condition === 'menor' ? 1 : -1;
                            linha += 1;
                        }
                    }
                }

                for (coluna = 1; coluna < dVarsLimit; coluna += 1) {
                    tabela[0][coluna] = -$scope.decisionVars[coluna - 1].value;
                }

                for (coluna; coluna < restLimit; coluna += 1) {
                    tabela[0][coluna] = 0;
                }
                tabela[0][coluna] = 0;

                return tabela;
            }

            function resolveFirstPhase(initialTable, varsSobra, varsAux) {
                var tabela = [[1]],
                    linha,
                    coluna,
                    iColuna,
                    i,
                    j;

                var totalColunas = $scope.decisionVars.length + varsSobra + varsAux + 2;
                var decisionVarsLength = $scope.decisionVars.length;
                var auxVarRangeMin = $scope.decisionVars.length + varsSobra + 1;
                var auxVarRangeMax = $scope.decisionVars.length + varsSobra + varsAux + 1;
                for (coluna = 1; coluna < totalColunas; coluna += 1) {
                    tabela[0][coluna] = coluna >= auxVarRangeMin && coluna < auxVarRangeMax ? -1 : 0;
                }

                for (linha = 1; linha < initialTable.length; linha += 1) {
                    tabela[linha] = angular.copy(initialTable[linha]);

                    for (coluna = auxVarRangeMin; coluna < auxVarRangeMax; coluna += 1) {
                        tabela[linha][coluna] = 0;
                    }
                    tabela[linha][coluna] = initialTable[linha][initialTable[linha].length - 1];
                }

                var base = [];

                for (linha = 1; linha <= initialTable.length; linha += 1) {
                    for (coluna = auxVarRangeMin; coluna < auxVarRangeMax; coluna += 1) {
                        if (!$scope.restrictions[linha - 1]) {
                            continue;
                        }
                        if ($scope.restrictions[linha - 1].condition === 'menor') {
                            linha += 1;
                            coluna -= 1;
                            base.push(decisionVarsLength + (linha - 1));
                        } else {
                            tabela[linha][coluna] = 1;
                            linha += 1;
                            base.push(decisionVarsLength + varsSobra + (linha - 2));
                        }
                    }
                }

                var baseInicial = angular.copy(base);
                var steps = []
                var iteration = 1;
                steps.push({
                    base: angular.copy(base),
                    tabela: angular.copy(tabela),
                    continua: true,
                    iteration: iteration
                });

                // somar a primeira linha com todas as linhas onde alguma variavel aux é 1
                for (linha = 1; linha < initialTable.length; linha += 1) {
                    for (coluna = auxVarRangeMin; coluna < auxVarRangeMax; coluna += 1) {
                        if (tabela[linha][coluna] === 1) {
                            for (iColuna = 0; iColuna < tabela[linha].length; iColuna += 1) {
                                tabela[0][iColuna] += tabela[linha][iColuna];
                            }
                            break;
                        }
                    }
                }

                var continua = testContinue(tabela, 'min');

                steps.push({
                    base: angular.copy(base),
                    tabela: angular.copy(tabela),
                    continua: continua,
                    iteration: ++iteration
                });

                while (continua && iteration < $scope.initial.iterationLimit) {
                    var enterVar = enterVariable(tabela, 'min');
                    var exitVar = exitVariable(tabela, enterVar);

                    if (!exitVar || !enterVar) {
                        continua = false;
                        break;
                    }

                    // transformacoes lineares
                    var pivo = tabela[exitVar][enterVar];
                    tabela[exitVar] = tabela[exitVar].map(function (elem) {
                        return Math.fround(elem / pivo);
                    });

                    for (i = 0; i < tabela.length; i += 1) {
                        if (i !== exitVar) {

                            var mul = tabela[i][enterVar];
                            for (j = 0; j < tabela[i].length; j += 1) {
                                tabela[i][j] = tabela[i][j] - mul * tabela[exitVar][j];
                            }
                        }
                    }

                    continua = testContinue(tabela, 'min');

                    var exitVarCorrect = base[exitVar - 1];

                    // atualiza a base
                    base[exitVar - 1] = enterVar;

                    iteration++;

                    steps.push({
                        enterVar: enterVar,
                        exitVar: exitVarCorrect,
                        base: angular.copy(base),
                        tabela: angular.copy(tabela),
                        continua: continua,
                        iteration: iteration,
                        limit: iteration >= $scope.initial.iterationLimit
                    });
                }

                for (linha = 0; linha < tabela.length; linha += 1) {
                    tabela[linha].splice(auxVarRangeMin, varsAux);
                }

                return {
                    tabela: tabela,
                    baseInicial: baseInicial,
                    base: base,
                    steps: steps
                };
            }

            $scope.calculateSimplex = function () {

                // construcao da tabela
                var tabela = [],
                    linha,
                    coluna,
                    i,
                    j;

                tabela[0] = [1];

                var varsSobra = $scope.restrictions.filter(function (rest) {
                    return rest.condition === 'menor' || rest.condition === 'maior';
                }).length;

                var varsAux = $scope.restrictions.filter(function (rest) {
                    return rest.condition === 'igual' || rest.condition === 'maior';
                }).length;

                $scope.twoPhases = !!varsAux;

                var base = [];

                var dVarsLimit = $scope.decisionVars.length + 1;
                var restLimit = dVarsLimit + varsSobra;

                tabela = createTable(dVarsLimit, restLimit);

                var firstPhaseSteps = [];
                var baseInicial = null;
                if ($scope.twoPhases) {

                    var firstPhase = resolveFirstPhase(tabela, varsSobra, varsAux);

                    tabela = firstPhase.tabela;
                    baseInicial = firstPhase.baseInicial;
                    base = firstPhase.base;
                    firstPhaseSteps = firstPhase.steps;

                    var iColuna;
                    for (coluna = 0; coluna < $scope.decisionVars.length; coluna += 1) {
                        tabela[0][coluna + 1] = -$scope.decisionVars[coluna].value;
                    }

                    for (coluna = 0; coluna < $scope.decisionVars.length; coluna += 1) {
                        linha = base.indexOf(coluna + 1);
                        if (linha !== -1) {
                            for (iColuna = 0; iColuna < tabela[linha + 1].length; iColuna += 1) {
                                tabela[0][iColuna] += $scope.decisionVars[coluna].value * tabela[linha + 1][iColuna];
                            }
                        }
                    }


                    firstPhaseSteps.push({
                        base: angular.copy(base),
                        tabela: angular.copy(tabela),
                        continua: true
                    });

                } else {
                    for (i = dVarsLimit; i < restLimit; i += 1) {
                        base.push(i);
                    }
                }
                $scope.steps = [];

                var continua = testContinue(tabela);

                $scope.steps.push({
                    base: angular.copy(baseInicial || base),
                    tabela: angular.copy(tabela),
                    continua: continua
                });

                $scope.steps = $scope.steps.concat(firstPhaseSteps);

                var iteration = 0;
                while (continua && iteration < $scope.initial.iterationLimit) {
                    var enterVar = enterVariable(tabela);
                    var exitVar = exitVariable(tabela, enterVar);

                    if (!exitVar || !enterVar) {
                        continua = false;
                        break;
                    }

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
                        secondPhase: $scope.twoPhases && iteration === 1,
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

                var variations = $scope.decisionVars.map(function (elem, i) {
                    linha = base.indexOf(i + 1);
                    if (linha === -1) {
                        return {
                            min: 0,
                            max: tabela[0][i + 1],
                            minCalc: elem.value,
                            maxCalc: elem.value + tabela[0][i + 1]
                        };
                    }

                    linha += 1;

                    var indivRes = [],
                        div,
                        min = -Number.MAX_VALUE,
                        max = Number.MAX_VALUE;

                    for (coluna = 1; coluna < tabela[0].length - 1; coluna += 1) {
                        if (tabela[linha][coluna] === 0 || tabela[0][coluna] === 0) {
                            continue;
                        }

                        div = -tabela[0][coluna] / tabela[linha][coluna];

                        if (tabela[linha][coluna] < 0) {
                            indivRes.push('dC' + (i + 1) + ' <= ' + div);
                            if (div < max) {
                                max = div;
                            }
                        } else if (tabela[linha][coluna] > 0) {
                            indivRes.push('dC' + (i + 1) + ' >= ' + div);
                            if (div > min) {
                                min = div;
                            }
                        }
                    }

                    return {
                        res: 'L1 = L1 + dC' + (i + 1) + ' * L' + (linha + 1),
                        indivRes: indivRes,
                        min: min,
                        max: max,
                        minCalc: elem.value + min,
                        maxCalc: elem.value + max
                    }
                });

                $scope.otimo = {
                    base: angular.copy(base),
                    tabela: angular.copy(tabela),
                    basicas: basicas,
                    notBasicas: notBasicas,
                    shadowPrice: shadowPrice,
                    reducedCost: reducedCost,
                    variations: variations
                };

                $scope.initial.locked = true;
                $scope.showResult = true;
            };

            setTimeout(function () {
                $scope.$apply(function () {
                    //$scope.calculateSimplex();
                });
            }, 1000);

        }]);
}());
