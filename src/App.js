import './App.css';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GuideBox } from '@midasit-dev/moaui';
import * as Buttons from './Components/Buttons';
import { CheckGroup,Check } from '@midasit-dev/moaui';
import Sep from "@midasit-dev/moaui/Components/Separator";
import ExcelReader from './Components/ExcelReader';
import * as XLSX from 'xlsx';
import { Panel } from '@midasit-dev/moaui'
import { Typography } from '@midasit-dev/moaui'
import ComponentsPanelTypographyDropList from './Components/ComponentsPanelTypographyDropList';
import { Scrollbars } from '@midasit-dev/moaui';
import ComponentsDialogHelpIconButton from './Components/ComponentsDialogHelpIconButton';
import { midasAPI } from "./Function/Common";
import { VerifyUtil, VerifyDialog } from "@midasit-dev/moaui";
function App() {
const [selectedLoadCombinationIndex, setSelectedLoadCombinationIndex] = useState(-1);
const [typeDropdownIndex, setTypeDropdownIndex] = useState(-1); 
const [showDialog, setDialogShowState] = React.useState(false);
const [inputValue, setInputValue] = useState('');
const fileInputRef = useRef(null); 
const [loadCaseDropdownIndex, setLoadCaseDropdownIndex] = useState(-1);
const [signDropdownIndex, setSignDropdownIndex] = useState(null);
const [editingFactor, setEditingFactor] = useState({ index: null, factor: null });
let loadNames = [];


  const toggleLoadCaseDropdown = (index) => {
    setLoadCaseDropdownIndex(loadCaseDropdownIndex === index ? -1 : index);
  };
  const toggleSignDropdown = (index) => {
    setSignDropdownIndex(signDropdownIndex === index ? null : index);
  };

  const handleLoadCaseOptionSelect = (loadCombinationIndex, loadCaseIndex, selectedLoadCase) => {
    const updatedLoadCombinations = [...loadCombinations];
    updatedLoadCombinations[loadCombinationIndex].loadCases[loadCaseIndex].loadCaseName = selectedLoadCase;
    setLoadCombinations(updatedLoadCombinations);
    setLoadCaseDropdownIndex(-1);
  };
  const handleSignOptionSelect = (combinationIndex, caseIndex, sign) => {
    const updatedLoadCombinations = [...loadCombinations];
    updatedLoadCombinations[combinationIndex].loadCases[caseIndex].sign = sign;
    setLoadCombinations(updatedLoadCombinations);
    setSignDropdownIndex(null);
  };
  const handleFactorClick = (index, factor) => {
    setEditingFactor({ index, factor });
  };

  const handleFactorBlur = (combinationIndex, loadCaseIndex, factorKey, newValue) => {
    console.log('Updating:', {
      combinationIndex,
      loadCaseIndex,
      factorKey,
      newValue,
    });
    const trimmedValue = newValue.trim();
    const updatedValue = isNaN(parseFloat(trimmedValue)) ? undefined : parseFloat(trimmedValue);
  
    setLoadCombinations((prevLoadCombinations) => {
      const updatedCombinations = prevLoadCombinations.map((combination, cIndex) => {
        if (cIndex === combinationIndex) {
          const updatedLoadCases = combination.loadCases.map((loadCase, lcIndex) => {
            if (lcIndex === loadCaseIndex) {
              return {
                ...loadCase,
                [factorKey]: updatedValue,
              };
            }
            return loadCase;
          });
  
          return {
            ...combination,
            loadCases: updatedLoadCases,
          };
        }
        return combination;
      });
  
      return updatedCombinations;
    });
  };
  
  loadNames = [
    "Dead Load",
    "Tendon Primary",
    "Creep Primary",
    "Shrinkage Primary",
    "Tendon Secondary",
    "Creep Secondary",
    "Shrinkage Secondary",
  ];
  
 async function Import_Load_Cases() {
    const stct = await midasAPI("GET", "/db/stct");
    const stldData = await midasAPI("GET", "/db/stld");
    const smlc = await midasAPI("GET", "/db/smlc");
    const mvldid = await midasAPI("GET", "/db/mvldid");
    const mvld = await midasAPI("GET", "/db/mvld");
    const mvldch = await midasAPI("GET", "/db/mvldch");
    const mvldeu = await midasAPI("GET", "/db/mvldeu");
    const mvldbs = await midasAPI("GET", "/db/mvldbs");
    const mvldpl = await midasAPI("GET", "/db/mvldpl");
    const splc = await midasAPI("GET", "/db/splc");
  
    if (stct && stct.STCT) {
      for (const key in stct.STCT) {
        const item = stct.STCT[key];
        if (item.vEREC) {
          item.vEREC.forEach((erec) => {
            if (erec.LTYPECC) {
              loadNames.push(erec.LTYPECC);
            }
          });
        }
      }
    }
  
    if (stldData && Object.keys(stldData)[0].length > 0) {
      const stldKeys = Object.keys(stldData)[0];
      if (stldKeys && stldKeys.length > 0) {
        for (const key in stldData[stldKeys]) {
          if (stldData[stldKeys].hasOwnProperty(key)) {
            const name = stldData[stldKeys][key].NAME;
            loadNames.push(name);
          }
        }
      }
    }
  
    if (smlc && smlc.SMLC) {
      for (const key in smlc.SMLC) {
        const item = smlc.SMLC[key];
        if (item.NAME) {
          const smlcName = item.NAME;
          loadNames.push(smlcName);
        }
      }
    }
  
    if (mvldid && mvldid.MVLDID) {
      for (const key in mvldid.MVLDID) {
        if (mvldid.MVLDID.hasOwnProperty(key)) {
          const item = mvldid.MVLDID[key];
          if (item && item.LCNAME) {
            loadNames.push(item.LCNAME);
          }
        }
      }
    }
  
    if (mvld && mvld.MVLD) {
      for (const key in mvld.MVLD) {
        if (mvld.MVLD.hasOwnProperty(key)) {
          const item = mvld.MVLD[key];
          if (item && item.LCNAME) {
            loadNames.push(item.LCNAME);
          }
        }
      }
    }
  
    if (mvldch && mvldch.MVLDCH) {
      for (const key in mvldch.MVLDCH) {
        if (mvldch.MVLDCH.hasOwnProperty(key)) {
          const item = mvldch.MVLDCH[key];
          if (item && item.LCNAME) {
            loadNames.push(item.LCNAME);
          }
        }
      }
    }
  
    if (mvldeu && mvldeu.MVLDEU) {
      for (const key in mvldeu.MVLDEU) {
        if (mvldeu.MVLDEU.hasOwnProperty(key)) {
          const item = mvldeu.MVLDEU[key];
          if (item && item.LCNAME) {
            loadNames.push(item.LCNAME);
          }
        }
      }
    }
  
    if (mvldbs && mvldbs.MVLDBS) {
      for (const key in mvldbs.MVLDBS) {
        if (mvldbs.MVLDBS.hasOwnProperty(key)) {
          const item = mvldbs.MVLDBS[key];
          if (item && item.LCNAME) {
            loadNames.push(item.LCNAME);
          }
        }
      }
    }
  
    if (mvldpl && mvldpl.MVLDPL) {
      for (const key in mvldpl.MVLDPL) {
        if (mvldpl.MVLDPL.hasOwnProperty(key)) {
          const item = mvldpl.MVLDPL[key];
          if (item && item.LCNAME) {
            loadNames.push(item.LCNAME);
          }
        }
      }
    }
  
    if (splc && splc.SPLC) {
      for (const key in splc.SPLC) {
        const item = splc.SPLC[key];
        if (item.NAME) {
          const spName = item.NAME;
          loadNames.push(spName);
        }
      }
    }
  
    console.log(loadNames);
  };

function importLoadCombinationInput(data) {
  setLoadCombinations(data);
}


  const handleLoadCombinationClick = (index) => {
    setSelectedLoadCombinationIndex(index);
  };

function Export_Load_Combination_Input() {
 
}
function getLoadCaseFactors(loadCaseName, combinations) {
  const cleanedLoadCaseName = loadCaseName.replace(/\s*\(CB\)$/, '');
  for (const combo of combinations) {
    if (cleanedLoadCaseName === combo.loadCombination) {
      return combo;
    }
  }
  return null;
}
function combineArrays(arrays) {
  let result = arrays[0] || []; // Start with the first array or an empty array
  
  for (let i = 1; i < arrays.length; i++) {
    const nextArray = arrays[i];
    const newResult = [];
    
    for (const resElement of result) {
      for (const nextElement of nextArray) {
        // Combine the current result with the next element
        newResult.push([...resElement, nextElement]);
      }
    }
    
    result = newResult;
  }
  
  return result;
}
function generatePermutationsOfCombinations(basicCombinations) {
  const allPermutations = combineArrays(basicCombinations);
  return allPermutations;
}
function handleSignCases(sign, loadCase, factor) {  
  const result = [];
  if (sign === "+") {
    result.push({ name: loadCase.loadCaseName, sign: "+", factor });
  } else if (sign === "-") {
    result.push({ name: loadCase.loadCaseName, sign: "-", factor });   
  } else if (sign === "±") {
    result.push(
      { name: loadCase.loadCaseName, sign: "+", factor },
      { name: loadCase.loadCaseName, sign: "-", factor }
    );
  }
  return result;
}
// function createCombinations(loadCases, strengthCombination, combinations, loadNames, result, factors, factor,factorArray, sign) {
//   if (loadNames.includes(loadCases.loadCaseName)) {
//     // Update the loadCaseObj with sign
//     const loadCaseObj = {
//       loadCaseName: loadCases.loadCaseName,
//       sign: sign,
//       factor: factors
//     };

//     result.push(loadCaseObj);
//   } else {
//     const modifyName = getLoadCaseFactors(loadCases.loadCaseName, combinations);
//     const newLoadCases = combinations.find(combo => combo.loadCombination === modifyName.loadCombination);

//     if (newLoadCases && Array.isArray(newLoadCases.loadCases)) {
//       if (newLoadCases.type === "Either") {
//         result["Either"] = result["Either"] || [];
//         const eitherResult = [];

//         for (let factor = 1; factor <= 5; factor++) {
//           const tempArray = [];
//           newLoadCases.loadCases.forEach(eitherLoadCase => {
//             const currentFactorValue = eitherLoadCase[`factor${factor}`];
//             if (currentFactorValue === undefined) return;
//             const newSign = multiplySigns(sign, eitherLoadCase.sign || '+');
//             createCombinations(eitherLoadCase, strengthCombination, combinations, loadNames, tempArray, currentFactorValue * factors, factor, newSign);
//           });

//           eitherResult.push(tempArray);
//         }

//         result["Either"].push(eitherResult);
//       } else if (newLoadCases.type === "Add") {
//         result["Add"] = result["Add"] || [];
//         const addResult = [];

//         for (let factor = 1; factor <= 5; factor++) {
//           const tempArray_add = [];

//           newLoadCases.loadCases.forEach(addLoadCase => {
//             const currentFactorValue = addLoadCase[`factor${factor}`];
//             if (currentFactorValue === undefined) return;

//             // Multiply signs as well as factors
//             const newSign = multiplySigns(sign, addLoadCase.sign || '+');
//             createCombinations(addLoadCase, strengthCombination, combinations, loadNames, tempArray_add, currentFactorValue * factors, factor, newSign);
//           });

//           addResult.push(tempArray_add);
//         }

//         result["Add"].push(addResult);
//       }
//     } else {
//       console.error(`Load case ${loadCases.loadCaseName} not found in combinations.`);
//     }
//   }
//   console.log(result);
//   return result;
// }
// function createCombinations(loadCases, strengthCombination, combinations, loadNames, result, value, factor, sign) {
//   // Initialize factorArray as a 5x5 matrix
//   let factorArray = new Array(5).fill(undefined).map(() => new Array(5).fill(undefined));

//   if (loadNames.includes(loadCases.loadCaseName)) {
//     // Iterate through factors 1 to 5
//     for (let i = 1; i <= 5; i++) {
//       const factorKey = `factor${i}`;    
//       // Multiply the factor by the corresponding value
//       let multipliedFactor = loadCases[factorKey] * value;
//       if ( i ==  factor) {
//          multipliedFactor = loadCases[factorKey] !== undefined ? loadCases[factorKey] * value : 1;
//       }
//       // Ensure the factorArray[factor] is initialized correctly
//       if (!Array.isArray(factorArray[factor])) {
//         factorArray[factor-1] = new Array(5).fill(undefined);
//       }
//       // Store the multiplied factor in the factorArray at the correct index (i-1 because array is 0-based)
//       factorArray[factor-1][i - 1] = multipliedFactor;
//     }
//     // Create the loadCaseObj with the entire factorArray
//     const loadCaseObj = {
//       loadCaseName: loadCases.loadCaseName,
//       sign: sign,
//       factor: factorArray // Here you store the whole factorArray in the object
//     };
    
//     // Add this loadCaseObj to the result array
//     result.push(loadCaseObj);

//   } else {
//     // Handle cases where the loadCaseName is not in loadNames
//     const modifyName = getLoadCaseFactors(loadCases.loadCaseName, combinations);
//     const newLoadCases = combinations.find(combo => combo.loadCombination === modifyName.loadCombination);

//     if (newLoadCases && Array.isArray(newLoadCases.loadCases)) {
//       if (newLoadCases.type === "Either") {
//         result["Either"] = result["Either"] || [];
//         const eitherResult = [];

//         for (let factorIndex = 1; factorIndex <= 5; factorIndex++) {
//           const tempArray = [];

//           newLoadCases.loadCases.forEach(eitherLoadCase => {
//             const currentFactorValue = eitherLoadCase[`factor${factorIndex}`];
//             if (currentFactorValue === undefined) return;

//             const newSign = multiplySigns(sign, eitherLoadCase.sign || '+');

//             if (!Array.isArray(factorArray[factor])) {
//               factorArray[factor] = new Array(5).fill(undefined);
//             }

//             const multipliedFactor = currentFactorValue * value;

//             factorArray[factor][factorIndex - 1] = multipliedFactor;

//             createCombinations(
//               eitherLoadCase,
//               strengthCombination,
//               combinations,
//               loadNames,
//               tempArray,
//               multipliedFactor,
//               factorIndex,
//               newSign
//             );
//           });

//           eitherResult.push(tempArray);
//         }

//         result["Either"].push(eitherResult);
//       } else if (newLoadCases.type === "Add") {
//         result["Add"] = result["Add"] || [];
//         const addResult = [];

//         for (let factorIndex = 1; factorIndex <= 5; factorIndex++) {
//           const tempArray_add = [];

//           newLoadCases.loadCases.forEach(addLoadCase => {
//             const currentFactorValue = addLoadCase[`factor${factorIndex}`];
//             if (currentFactorValue === undefined) return;

//             const newSign = multiplySigns(sign, addLoadCase.sign || '+');

//             if (!Array.isArray(factorArray[factor])) {
//               factorArray[factor] = new Array(5).fill(undefined);
//             }
//             const multipliedFactor = currentFactorValue * value;
//             factorArray[factor][factorIndex - 1] = multipliedFactor;

//             createCombinations(
//               addLoadCase,
//               strengthCombination,
//               combinations,
//               loadNames,
//               tempArray_add,
//               multipliedFactor,
//               factorIndex,
//               newSign
//             );
//           });
//           addResult.push(tempArray_add);
//         }
//         result["Add"].push(addResult);
//       }
//     } else {
//       console.error(`Load case ${loadCases.loadCaseName} not found in combinations.`);
//     }
//   }
//   console.log(factorArray); // Check how the factorArray looks
//   console.log(result); // Check how the result is accumulating
//   return result;
// }

// Helper function to create an n-dimensional array
function createNDimensionalArray(dimensions, fillValue = undefined) {
  if (dimensions <= 0) return fillValue;
  return new Array(5).fill(undefined).map(() => createNDimensionalArray(dimensions - 1, fillValue));
}

function createCombinations(loadCases, strengthCombination, combinations, loadNames, result, value, factor, sign, dimension = 1, factorIndexArray = []) {
  // Initialize factorArray with dynamic dimensions
  let factorArray = createNDimensionalArray(dimension);
  if (loadNames.includes(loadCases.loadCaseName)) {
    // If loadCaseName exists in loadNames
    for (let i = 1; i <= 5; i++) {
      const factorKey = `factor${i}`;
      let multipliedFactor = loadCases[factorKey] * value;
      if (i === factor) {
        multipliedFactor = loadCases[factorKey] !== undefined ? loadCases[factorKey] * value : 0;
      }
      // const previousFactor = factorIndexArray.length > 0 ? factorIndexArray[factorIndexArray.length - 1 - 1] - 1 : i - 1;

      // const indices = [i - 1, factor - 1].concat(new Array(dimension - 2).fill(previousFactor)); // Adjust for `n` dimensions

      // Set the value in the n-dimensional array using the dynamic indices
      // Remove the last value from factorIndexArray
 // Handling dimension 1
 if (dimension === 1) {
  // In 1D array, we simply set the value at the first index
  setFactorArrayValue(factorArray, multipliedFactor, 1, dimension, [i - 1]);
}
// Handling dimension 2
else if (dimension === 2) {
  // In 2D array, set the value at the correct row and column (i-1, factor-1)
  setFactorArrayValue(factorArray, multipliedFactor, 1, dimension, [i - 1, factor - 1]);
}
// Handling dimensions greater than 2
else if (dimension > 2) {
  // Adjust for `n` dimensions
  let previousFactorArray = [...factorIndexArray]; // Create a shallow copy of the array
  previousFactorArray.pop(); // Remove the last value

  // Fill `previousFactor` array based on dimension - 2
  let previousFactor = previousFactorArray.length > 0 
    ? previousFactorArray 
    : [i - 1]; // If factorIndexArray is empty, use [i - 1] as default

  // Create indices, adjusting for `n` dimensions
  const indices = [i - 1, factor - 1].concat(
    new Array(dimension - 2).fill(previousFactor[previousFactor.length - 1] - 1)
  );
  setFactorArrayValue(factorArray, multipliedFactor, 1, dimension, indices);
}
}
    const loadCaseObj = {
      loadCaseName: loadCases.loadCaseName,
      sign: sign,
      factor: factorArray
    };
    result.push(loadCaseObj);
  } else {
    const modifyName = getLoadCaseFactors(loadCases.loadCaseName, combinations);
    const newLoadCases = combinations.find(combo => combo.loadCombination === modifyName.loadCombination);
    if (newLoadCases && Array.isArray(newLoadCases.loadCases)) {
      if (newLoadCases.type === "Either") {
        result["Either"] = result["Either"] || [];
        const eitherResult = [];
        for (let factorIndex = 1; factorIndex <= 5; factorIndex++) {
          const tempArray = [];
          newLoadCases.loadCases.forEach(eitherLoadCase => {
            const currentFactorValue = eitherLoadCase[`factor${factorIndex}`];
            if (currentFactorValue === undefined) return;
            const newSign = multiplySigns(sign, eitherLoadCase.sign || '+');
            if (loadNames.includes(eitherLoadCase.loadCaseName)) {
              if (factorIndex === 1) {
                // Reinitialize factorArray for dynamic dimensions
                factorArray = createNDimensionalArray(dimension);
                for (let i = 1; i <= 5; i++) {
                  const factorKey = `factor${i}`;
                  let multipliedFactor = eitherLoadCase[factorKey] * value;
                  multipliedFactor = eitherLoadCase[factorKey] !== undefined ? eitherLoadCase[factorKey] * value : 0;
                  // const previousFactor = factorIndexArray.length > 0 ? factorIndexArray[factorIndexArray.length - 1 -1] - 1: i - 1;
                  // const indices = [i - 1, factor - 1].concat(new Array(dimension - 2).fill(previousFactor)); // Adjust for `n` dimensions
                  // Remove the last value from factorIndexArray
 // Handling dimension 1
 if (dimension === 1) {
  // In 1D array, we simply set the value at the first index
  setFactorArrayValue(factorArray, multipliedFactor, 1, dimension, [i - 1]);
}
// Handling dimension 2
else if (dimension === 2) {
  // In 2D array, set the value at the correct row and column (i-1, factor-1)
  setFactorArrayValue(factorArray, multipliedFactor, 1, dimension, [i - 1, factor - 1]);
}
// Handling dimensions greater than 2
else if (dimension > 2) {
  // Adjust for `n` dimensions
  let previousFactorArray = [...factorIndexArray]; // Create a shallow copy of the array
  previousFactorArray.pop(); // Remove the last value

  // Fill `previousFactor` array based on dimension - 2
  let previousFactor = previousFactorArray.length > 0 
    ? previousFactorArray 
    : [i - 1]; // If factorIndexArray is empty, use [i - 1] as default

  // Create indices, adjusting for `n` dimensions
  const indices = [i - 1, factor - 1].concat(
    new Array(dimension - 2).fill(previousFactor[previousFactor.length - 1] -1)
  );
  setFactorArrayValue(factorArray, multipliedFactor, 1, dimension, indices);
}
}
                const loadCaseObj = {
                  loadCaseName: eitherLoadCase.loadCaseName,
                  sign: newSign,
                  factor: factorArray
                };
                tempArray.push(loadCaseObj);
              }
            } else {
              createCombinations(
                eitherLoadCase,
                strengthCombination,
                combinations,
                loadNames,
                tempArray,
                currentFactorValue * value,
                factorIndex,
                newSign,
                dimension + 1,// Increment dimension for recursive calls
                [...factorIndexArray, factorIndex]
              );
            }
          });
          eitherResult.push(tempArray);
        }
        result["Either"].push(eitherResult);
      } else if (newLoadCases.type === "Add") {
        result["Add"] = result["Add"] || [];
        let addResult = [];
        for (let factorIndex = 1; factorIndex <= 5; factorIndex++) {
          let tempArray_add = [];
          newLoadCases.loadCases.forEach(addLoadCase => {
            const currentFactorValue = addLoadCase[`factor${factorIndex}`];
            if (currentFactorValue === undefined) return;
            const newSign = multiplySigns(sign, addLoadCase.sign || '+');
            if (loadNames.includes(addLoadCase.loadCaseName)) {
              if (factorIndex === 1) {
                factorArray = createNDimensionalArray(dimension);
                for (let i = 1; i <= 5; i++) {
                  const factorKey = `factor${i}`;
                  let multipliedFactor = addLoadCase[factorKey] * value;
                  multipliedFactor = addLoadCase[factorKey] !== undefined ? addLoadCase[factorKey] * value : 0;
                   // Handling dimension 1
      if (dimension === 1) {
        // In 1D array, we simply set the value at the first index
        setFactorArrayValue(factorArray, multipliedFactor, 1, dimension, [i - 1]);
      }
      // Handling dimension 2
      else if (dimension === 2) {
        // In 2D array, set the value at the correct row and column (i-1, factor-1)
        setFactorArrayValue(factorArray, multipliedFactor, 1, dimension, [i - 1, factor - 1]);
      }
      // Handling dimensions greater than 2
      else if (dimension > 2) {
        // Adjust for `n` dimensions
        let previousFactorArray = [...factorIndexArray]; // Create a shallow copy of the array
        previousFactorArray.pop(); // Remove the last value

        // Fill `previousFactor` array based on dimension - 2
        let previousFactor = previousFactorArray.length > 0 
          ? previousFactorArray 
          : [i - 1]; // If factorIndexArray is empty, use [i - 1] as default

        // Create indices, adjusting for `n` dimensions
        const indices = [i - 1, factor - 1].concat(
          new Array(dimension - 2).fill(previousFactor[previousFactor.length - 1] -1)
        );
        setFactorArrayValue(factorArray, multipliedFactor, 1, dimension, indices);
      }
    }
                const loadCaseObj = {
                  loadCaseName: addLoadCase.loadCaseName,
                  sign: newSign,
                  factor: factorArray
                };
                tempArray_add.push(loadCaseObj);
              }
            } else {
              createCombinations(
                addLoadCase,
                strengthCombination,
                combinations,
                loadNames,
                tempArray_add,
                currentFactorValue * value,
                factorIndex,
                newSign,
                dimension + 1,// Increment dimension for recursive calls
                [...factorIndexArray, factorIndex] 
              );
            }
          });
          addResult.push(tempArray_add);
        }
        result["Add"].push(addResult);
      }
    }
  }
  console.log(factorIndexArray);
  console.log(result);  
  return result;
}
function setFactorArrayValue(factorArray, multipliedFactor, currentDimension, maxDimension, indices) {
  if (currentDimension === maxDimension) {
    // We are at the deepest dimension; assign the multiplied factor
    factorArray[indices[0]] = multipliedFactor;
  } else {
    // Recurse deeper by checking the next dimension
    let nextArray = factorArray[indices[0]];
    setFactorArrayValue(nextArray, multipliedFactor, currentDimension + 1, maxDimension, indices.slice(1));
  }
}

// function createCombinations(loadCases, strengthCombination, combinations, loadNames, result, value, factor, sign, dimension = 2, factorIndexArray = []) {
//   // Initialize factorArray with dynamic dimensions
//   let factorArray = createNDimensionalArray(dimension);
  
//   if (loadNames.includes(loadCases.loadCaseName)) {
//     for (let i = 1; i <= 5; i++) {
//       const factorKey = `factor${i}`;
//       let multipliedFactor = loadCases[factorKey] * value;

//       if (i === factor) {
//         multipliedFactor = loadCases[factorKey] !== undefined ? loadCases[factorKey] * value : 0;
//       }

//       // Define the indices for positioning, based on current iteration and factor index
//       const indices = [i - 1, factor - 1].concat(new Array(dimension - 2).fill(i - 1)); // Adjust for `n` dimensions

//       // Set the value in the n-dimensional array using the dynamic indices
//       setFactorArrayValue(factorArray, multipliedFactor, 1, dimension, indices);
//     }

//     const loadCaseObj = {
//       loadCaseName: loadCases.loadCaseName,
//       sign: sign,
//       factor: factorArray
//     };
//     result.push(loadCaseObj);
//   } else {
//     // Handle the logic for combinations when the load case name isn't in loadNames
//     const modifyName = getLoadCaseFactors(loadCases.loadCaseName, combinations);
//     const newLoadCases = combinations.find(combo => combo.loadCombination === modifyName.loadCombination);

//     if (newLoadCases && Array.isArray(newLoadCases.loadCases)) {
//       if (newLoadCases.type === "Either") {
//         result["Either"] = result["Either"] || [];
//         const eitherResult = [];
        
//         for (let factorIndex = 1; factorIndex <= 5; factorIndex++) {
//           const tempArray = [];
          
//           newLoadCases.loadCases.forEach(eitherLoadCase => {
//             const currentFactorValue = eitherLoadCase[`factor${factorIndex}`];
//             if (currentFactorValue === undefined) return;

//             const newSign = multiplySigns(sign, eitherLoadCase.sign || '+');
//             if (loadNames.includes(eitherLoadCase.loadCaseName)) {
//               if (factorIndex === 1) {
//                 factorArray = createNDimensionalArray(dimension);
                
//                 for (let i = 1; i <= 5; i++) {
//                   const factorKey = `factor${i}`;
//                   let multipliedFactor = eitherLoadCase[factorKey] * value;
//                   multipliedFactor = eitherLoadCase[factorKey] !== undefined ? eitherLoadCase[factorKey] * value : 0;

//                   const indices = [i - 1, factor - 1].concat(new Array(dimension - 2).fill(i - 1)); // Adjust for `n` dimensions
//                   setFactorArrayValue(factorArray, multipliedFactor, 1, dimension, indices);
//                 }

//                 const loadCaseObj = {
//                   loadCaseName: eitherLoadCase.loadCaseName,
//                   sign: newSign,
//                   factor: factorArray
//                 };
//                 tempArray.push(loadCaseObj);
//               }
//             } else {
//               createCombinations(
//                 eitherLoadCase,
//                 strengthCombination,
//                 combinations,
//                 loadNames,
//                 tempArray,
//                 currentFactorValue * value,
//                 factorIndex,
//                 newSign,
//                 dimension + 1,  // Increment dimension for recursive calls
//                 [...factorIndexArray, factorIndex]
//               );
//             }
//           });
//           eitherResult.push(tempArray);
//         }
//         result["Either"].push(eitherResult);
//       }
//       // Additional logic for 'Add' type combinations can be handled similarly
//     }
//   }

//   console.log(factorIndexArray);
//   console.log(result);
//   return result;
// }

// function createCombinations(loadCases, strengthCombination, combinations, loadNames, result, value, factor, sign, dimension = 0) {
//   // Update factorArray size based on the dimension
//   let factorArray = new Array(5).fill(undefined).map(() => new Array(5).fill(undefined));

//   if (loadNames.includes(loadCases.loadCaseName)) {
//     // If loadCaseName exists in loadNames
//     for (let i = 1; i <= 5; i++) {
//       const factorKey = `factor${i}`;
//       let multipliedFactor = loadCases[factorKey] * value;
//       if (i === factor) {
//         multipliedFactor = loadCases[factorKey] !== undefined ? loadCases[factorKey] * value : 0;
//       }
//       if (!Array.isArray(factorArray[factor - 1])) {
//         factorArray[factor - 1] = new Array(5).fill(undefined);
//       }
//       factorArray[i - 1][factor - 1] = multipliedFactor;
//     }

//     const loadCaseObj = {
//       loadCaseName: loadCases.loadCaseName,
//       sign: sign,
//       factor: factorArray
//     };
//     result.push(loadCaseObj);
//   } else {
//     const modifyName = getLoadCaseFactors(loadCases.loadCaseName, combinations);
//     const newLoadCases = combinations.find(combo => combo.loadCombination === modifyName.loadCombination);
    
//     if (newLoadCases && Array.isArray(newLoadCases.loadCases)) {
//       if (newLoadCases.type === "Either") {
//         result["Either"] = result["Either"] || [];
//         const eitherResult = [];
        
//         for (let factorIndex = 1; factorIndex <= 5; factorIndex++) {
//           const tempArray = [];
          
//           newLoadCases.loadCases.forEach(eitherLoadCase => {
//             const currentFactorValue = eitherLoadCase[`factor${factorIndex}`];
//             if (currentFactorValue === undefined) return;
//             const newSign = multiplySigns(sign, eitherLoadCase.sign || '+');
            
//             if (loadNames.includes(eitherLoadCase.loadCaseName)) {
//               if (factorIndex == 1) {
//                 // Reinitialize factorArray for the first factor
//                 factorArray = new Array(dimension + 5).fill(undefined).map(() => new Array(dimension + 5).fill(undefined));
                
//                 for (let i = 1; i <= 5; i++) {
//                   const factorKey = `factor${i}`;
//                   let multipliedFactor = eitherLoadCase[factorKey] * value;
//                   multipliedFactor = eitherLoadCase[factorKey] !== undefined ? eitherLoadCase[factorKey] * value : 0;
//                   if (!Array.isArray(factorArray[factor - 1])) {
//                     factorArray[factor - 1] = new Array(dimension + 5).fill(undefined);
//                   }
//                   factorArray[i - 1][factor - 1] = multipliedFactor;
//                 }

//                 const loadCaseObj = {
//                   loadCaseName: eitherLoadCase.loadCaseName,
//                   sign: newSign,
//                   factor: factorArray
//                 };
//                 tempArray.push(loadCaseObj);
//               }
//             } else {
//               // Recursive call with incremented dimension count
//               createCombinations(
//                 eitherLoadCase,
//                 strengthCombination,
//                 combinations,
//                 loadNames,
//                 tempArray,
//                 currentFactorValue * value,
//                 factorIndex,
//                 newSign,
//                 dimension + 1 // Increment the dimension
//               );
//             }
//           });
//           eitherResult.push(tempArray);
//         }
//         result["Either"].push(eitherResult);
//       } else if (newLoadCases.type === "Add") {
//         result["Add"] = result["Add"] || [];
//         let addResult = [];
        
//         for (let factorIndex = 1; factorIndex <= 5; factorIndex++) {
//           let tempArray_add = [];
          
//           newLoadCases.loadCases.forEach(addLoadCase => {
//             const currentFactorValue = addLoadCase[`factor${factorIndex}`];
//             if (currentFactorValue === undefined) return;
//             const newSign = multiplySigns(sign, addLoadCase.sign || '+');
            
//             if (loadNames.includes(addLoadCase.loadCaseName)) {
//               if (factorIndex == 1) {
//                 // Reinitialize factorArray for the first factor
//                 factorArray = new Array(dimension + 5).fill(undefined).map(() => new Array(dimension + 5).fill(undefined));
                
//                 for (let i = 1; i <= 5; i++) {
//                   const factorKey = `factor${i}`;
//                   let multipliedFactor = addLoadCase[factorKey] * value;
//                   multipliedFactor = addLoadCase[factorKey] !== undefined ? addLoadCase[factorKey] * value : 0;
//                   if (!Array.isArray(factorArray[factor - 1])) {
//                     factorArray[factor - 1] = new Array(dimension + 5).fill(undefined);
//                   }
//                   factorArray[i - 1][factor - 1] = multipliedFactor;
//                 }

//                 const loadCaseObj = {
//                   loadCaseName: addLoadCase.loadCaseName,
//                   sign: newSign,
//                   factor: factorArray
//                 };
//                 tempArray_add.push(loadCaseObj);
//               }
//             } else {
//               // Recursive call with incremented dimension count
//               createCombinations(
//                 addLoadCase,
//                 strengthCombination,
//                 combinations,
//                 loadNames,
//                 tempArray_add,
//                 currentFactorValue * value,
//                 factorIndex,
//                 newSign,
//                 dimension + 1 // Increment the dimension
//               );
//             }
//           });
//           addResult.push(tempArray_add);
//         } 
//         result["Add"].push(addResult);
//       }
//     }
//   }
//   console.log(result);
//   return result;
// }

// function createCombinations(loadCases, strengthCombination, combinations, loadNames, result, value, factor, sign) {
//   // Initialize a simple 5x5 factor array
//   let factorArray = new Array(5).fill(null).map(() => new Array(5).fill(null));
//   // Function to fill the array based on the loadCase and value
//   const processArray = (loadCase, value) => {
//     for (let i = 0; i < factorArray.length; i++) {
//       for (let j = 0; j < factorArray[i].length; j++) {
//         // Dynamically construct the factor key
//         const factorKey = `factor${i + 1}`;
//         const factorValue = loadCase[factorKey];
//         factorArray[i][j] = factorValue !== undefined ? factorValue * value : 0;
//       }
//     }
//   };
//   // Check if loadCaseName is present in loadNames
//   if (loadNames.includes(loadCases.loadCaseName)) {
//     processArray(loadCases, value);
//     // Store the result
//     result.push({
//       loadCaseName: loadCases.loadCaseName,
//       sign: sign,
//       factor: factorArray,
//     });
//   } else {
//     const modifyName = getLoadCaseFactors(loadCases.loadCaseName, combinations);
//     const newLoadCases = combinations.find(
//       (combo) => combo.loadCombination === modifyName.loadCombination
//     );

//     if (newLoadCases && Array.isArray(newLoadCases.loadCases)) {
//       newLoadCases.loadCases.forEach((eitherLoadCase) => {
//         const factorValue = eitherLoadCase[`factor${factor}`];
//         if (factorValue === undefined) return;

//         const newSign = multiplySigns(sign, eitherLoadCase.sign || "+");

//         if (loadNames.includes(eitherLoadCase.loadCaseName)) {
//           processArray(eitherLoadCase, value);
//           result.push({
//             loadCaseName: eitherLoadCase.loadCaseName,
//             sign: newSign,
//             factor: factorArray,
//           });
//         } else {
//           // Recursive call for nested load cases
//           createCombinations(
//             eitherLoadCase,
//             strengthCombination,
//             combinations,
//             loadNames,
//             result,
//             factorValue * value,
//             factor,
//             newSign
//           );
//         }
//       });
//     }
//   }

//   console.log(result);
//   return result;
// }

// function createNestedArray(depth, size) {
//   let nestedArray = new Array(size).fill(null);

//   for (let i = 1; i < depth; i++) {
//     // At each depth level, map through the current array and replace each element with a new array
//     nestedArray = nestedArray.map(() => new Array(size).fill(null));
//   }

//   return nestedArray;
// }

// // Main function to process load cases and fill the factor array
// function processArray(loadCase, value, array, currentDepth, size) {
//   // Check if the current array is initialized, if not, initialize it
//   if (!array) {
//     array = new Array(size).fill(null);
//   }
//   // Base case: if the current depth is 1, stop further recursion
//   if (currentDepth === 1) {
//     // At the deepest level, fill the array with the calculated factor values
//     for (let i = 0; i < array.length; i++) {
//       const factorKey = `factor${i + 1}`;
//       const factorValue = loadCase[factorKey];
//       array[i] = factorValue !== undefined ? factorValue * value : 0;
//     }
//   } else {
//     // Iterate over each nested array and continue processing
//     for (let i = 0; i < array.length; i++) {
//       // Recursively process the next depth, ensure the next level is initialized
//       if (!array[i]) {
//         array[i] = new Array(size).fill(null); // Initialize the next nested array if it's null
//       }
//       processArray(loadCase, value, array[i], currentDepth - 1, size); // Go deeper by decreasing depth
//     }
//   }
//   return array; // Return the updated array for further processing
// }
 
// // Example usage of the modified processArray
// function createCombinations(loadCases, strengthCombination, combinations, loadNames, result, value, factor, sign, depth) {
//   const size = 5; // Assuming size is 5 based on earlier examples
//   let factorArray = createNestedArray(depth, size);  // Creates a 5x5x... array depending on `depth`
//   // Main logic for checking and processing load cases
//   if (loadNames.includes(loadCases.loadCaseName)) {
//     // If the load case is valid, process it and store it in factorArray
//     factorArray = processArray(loadCases, value, factorArray, depth, size);
//     result.push({
//       loadCaseName: loadCases.loadCaseName,
//       sign: sign,
//       factor: factorArray,
//     });
//   } else {
//     // Handle combinations and recursive cases
//     const modifyName = getLoadCaseFactors(loadCases.loadCaseName, combinations);
//     const newLoadCases = combinations.find(
//       (combo) => combo.loadCombination === modifyName.loadCombination
//     );
//     if (newLoadCases && Array.isArray(newLoadCases.loadCases)) {
//       newLoadCases.loadCases.forEach((eitherLoadCase) => {
//         const factorValue = eitherLoadCase[`factor${factor}`];
//         if (factorValue === undefined) return;

//         const newSign = multiplySigns(sign, eitherLoadCase.sign || "+");

//         if (loadNames.includes(eitherLoadCase.loadCaseName)) {
//           factorArray = processArray(eitherLoadCase, value, factorArray, depth, size);

//           result.push({
//             loadCaseName: eitherLoadCase.loadCaseName,
//             sign: newSign,
//             factor: factorArray,
//           });
//         } else {
//           createCombinations(
//             eitherLoadCase,
//             strengthCombination,
//             combinations,
//             loadNames,
//             result,
//             factorValue * value,
//             factor,
//             newSign,
//             depth
//           );
//         }
//       });
//     }
//   }
//   console.log(result);
//   return result;
// }

function multiplySigns(sign1, sign2) {
  // Handle basic sign multiplication
  if ((sign1 === '+' && sign2 === '+') || (sign2 === '+' && sign1 === '+')) return '+';
  if ((sign1 === '+' && sign2 === '-') || (sign2 === '+' && sign1 === '-')) return '-';
  if ((sign1 === '-' && sign2 === '+') || (sign2 === '-' && sign1 === '+')) return '-';
  if ((sign1 === '-' && sign2 === '-') || (sign2 === '-' && sign1 === '-')) return '+';

  // Handle combinations with +,-
  if ((sign1 === '+,-' && sign2 === '+') || (sign2 === '+,-' && sign1 === '+')) return '+,-';
  if ((sign1 === '+,-' && sign2 === '-') || (sign2 === '+,-' && sign1 === '-')) return '-,+';
  if ((sign1 === '-' && sign2 === '+,-') || (sign2 === '-' && sign1 === '+,-')) return '-,+';
  if ((sign1 === '+,-' && sign2 === '+,-')) return '+,-';

  // Handle combinations with -,+
  if ((sign1 === '-,+' && sign2 === '+') || (sign2 === '-,+' && sign1 === '+')) return '-,+';
  if ((sign1 === '-,+' && sign2 === '-') || (sign2 === '-,+' && sign1 === '-')) return '+,-';
  if ((sign1 === '+' && sign2 === '-,+') || (sign2 === '+' && sign1 === '-,+')) return '+,-';
  if ((sign1 === '-' && sign2 === '-,+') || (sign2 === '-' && sign1 === '-,+')) return '+,-';
  if ((sign1 === '+,-' && sign2 === '-,+') || (sign2 === '+,-' && sign1 === '-,+')) return '+,-';
  if ((sign1 === '-,+' && sign2 === '+,-') || (sign2 === '-,+' && sign1 === '+,-')) return '+,-';
  if ((sign1 === '-,+' && sign2 === '-,+')) return '+,-';

  // Handle combinations with ±
  if ((sign1 === '±' && sign2 === '+') || (sign2 === '±' && sign1 === '+')) return '±'; // ± * + = ±
  if ((sign1 === '±' && sign2 === '-') || (sign2 === '±' && sign1 === '-')) return '∓'; // ± * - = ∓
  if ((sign1 === '±' && sign2 === '+,-') || (sign2 === '±' && sign1 === '+,-')) return '±'; // ± * +,- = ±
  if ((sign1 === '±' && sign2 === '-,+') || (sign2 === '±' && sign1 === '-,+')) return '∓'; // ± * -,+ = ∓
  if (sign1 === '±' && sign2 === '±') return '±'; // ± * ± = ±
  if (sign1 === '±' && sign2 === '∓') return '∓'; // ± * ∓ = ∓

  // Handle combinations with ∓ (inverse of ±)
  if ((sign1 === '∓' && sign2 === '+') || (sign2 === '∓' && sign1 === '+')) return '∓'; // ∓ * + = ∓
  if ((sign1 === '∓' && sign2 === '-') || (sign2 === '∓' && sign1 === '-')) return '±'; // ∓ * - = ±
  if ((sign1 === '∓' && sign2 === '+,-') || (sign2 === '∓' && sign1 === '+,-')) return '∓'; // ∓ * +,- = ∓
  if ((sign1 === '∓' && sign2 === '-,+') || (sign2 === '∓' && sign1 === '-,+')) return '±'; // ∓ * -,+ = ±
  if (sign1 === '∓' && sign2 === '±') return '∓'; // ∓ * ± = ∓
  if (sign1 === '∓' && sign2 === '∓') return '±'; // ∓ * ∓ = ±

  // Default to '+' if no match found
  return '+';
}
function combineAddEither(inputObj) {
  let eitherArray = []; 
  let addObj = []; 
  function processObject(obj, parentKey = null) {
    if (Array.isArray(obj)) {
      obj.forEach((value) => {
        if (typeof value === 'object' && value !== null) {
          processKeyValuePairs(value, parentKey);
        }
      });}
    else {
      processKeyValuePairs(obj, parentKey);
    }
  }
  function processKeyValuePairs(obj, parentKey) {
    // Loop through each key-value pair in the object
    for (const [key, value] of Object.entries(obj)) {
      // Only store the key if it's "Add" or "Either"
      if (key === 'Add' || key === 'Either') {
        parentKey = key;
      }
      if (Array.isArray(value)) {
        let temp = [];
        value.forEach((subArrayOrItem) => {
          if (Array.isArray(subArrayOrItem)) {
            // If the current value is a nested array, loop through the inner array
            subArrayOrItem.forEach((item) => {
              if (typeof item === 'object' && item !== null && Object.keys(item).length > 0) {
                // Check if the item has 'Add' or 'Either' and make the recursive call if needed
                if (item.Add || item.Either) {
                  processKeyValuePairs(item, parentKey); // Recursive call for nested 'Add' or 'Either'
                } else {
                  // Directly push the item if it doesn't have 'Add' or 'Either'
                  temp.push(item);
                }
              }
            });
          } else if (typeof subArrayOrItem === 'object' && subArrayOrItem !== null) {
            // If subArrayOrItem is a direct object (not an array)
            const newObj = {};
            // Loop through each property of the subArrayOrItem object
            for (const [itemKey, itemValue] of Object.entries(subArrayOrItem)) {
              newObj[itemKey] = itemValue; // Add each property to the new object
              // If the object contains "Add" or "Either", process it again
              if (itemKey === 'Add' || itemKey === 'Either') {
                processKeyValuePairs(subArrayOrItem, parentKey); // Recursive call
              }
            }
            // Push the new object into the temp array
            temp.push(newObj);
           } 
          else {
            // If the value is not an object, call processObject recursively
            processObject(subArrayOrItem, parentKey);
          }
        });
        if (parentKey === 'Either') {
          eitherArray.push(temp);
        } else if (parentKey === 'Add') {
          addObj.push(temp);
        } }
       else if (typeof value === 'object' && value !== null) {
        processObject(value, key);
      }
    }
  }
  function removeDuplicates(arr) {
    const uniqueSet = new Set(arr.map(item => JSON.stringify(item)));
    return Array.from(uniqueSet).map(item => JSON.parse(item));
  }
  function arraysAreEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    for (let i = 0; i < arr1.length; i++) {
        if (arr1[i] !== arr2[i]) return false;
    }
    return true;
}

function multipleFactor(input) {
  const addObj = [];
  
  input.forEach((subArray, subArrayIndex) => {
      let tempArray = [];  // Temporary array for the current subArray
      let loadCaseNames = [];  // Store the loadCaseName of the current object
      let additionalArray = [];  // Additional array to collect matches
      subArray.forEach((item, itemIndex) => {
          if (item === null) return; 
          tempArray = [];
          let temp = []; 
          if (typeof item === 'object' && item !== null && Object.keys(item).length > 0) {
              Object.keys(item).forEach((key) => {
                  // Extract loadCaseName, sign, and factor properties
                  if (item[key] && item[key].loadCaseName && item[key].sign && item[key].factor) {
                      loadCaseNames.push(item[key].loadCaseName);
                      temp.push({
                          loadCaseName: item[key].loadCaseName,
                          sign: item[key].sign,
                          factor: item[key].factor,
                      });
                  }
              });
          }
          tempArray.push(temp);
          for (let nextIndex = itemIndex + 1; nextIndex < subArray.length; nextIndex++) {
              let nextItem = subArray[nextIndex];
              if (nextItem === null) continue;  // Skip already processed items
              
              let loadCaseName_temp = [];
              if (typeof nextItem === 'object' && nextItem !== null && Object.keys(nextItem).length > 0) {
                  Object.keys(nextItem).forEach((nextKey) => {
                      // Extract and store next item's loadCaseName
                      if (nextItem[nextKey] && nextItem[nextKey].loadCaseName) {
                          loadCaseName_temp.push(nextItem[nextKey].loadCaseName);
                      }
                  });
              }
              if (arraysAreEqual(loadCaseNames, loadCaseName_temp)) {
                  // If loadCaseNames match, push both into additionalArray
                  let matchArray = [];
                  temp = []; 
                  Object.keys(nextItem).forEach((nextKey) => {
                      if (nextItem[nextKey] && nextItem[nextKey].loadCaseName && nextItem[nextKey].sign && nextItem[nextKey].factor) {
                          temp.push({
                              loadCaseName: nextItem[nextKey].loadCaseName,
                              sign: nextItem[nextKey].sign,
                              factor: nextItem[nextKey].factor,
                          });
                      }
                  });
                  tempArray.push(temp);
                  subArray[nextIndex] = null;
              }
          }
          for (let nextSubArrayIndex = subArrayIndex + 1; nextSubArrayIndex < input.length; nextSubArrayIndex++) {
              let nextSubArray = input[nextSubArrayIndex];

              nextSubArray.forEach((nextItem, nextItemIndex) => {
                  if (nextItem === null) return;  // Skip already processed items

                  let loadCaseName_temp = [];

                  if (typeof nextItem === 'object' && nextItem !== null && Object.keys(nextItem).length > 0) {
                      Object.keys(nextItem).forEach((nextKey) => {
                          if (nextItem[nextKey] && nextItem[nextKey].loadCaseName) {
                              loadCaseName_temp.push(nextItem[nextKey].loadCaseName);
                          }
                      });
                  }

                  // Compare the current loadCaseNames with the next sub-array item
                  if (arraysAreEqual(loadCaseNames, loadCaseName_temp)) {
                      // If they match, add both to additionalArray
                      let matchArray = [];
                      // matchArray.push(temp);
                      temp = [];  // Clear temp for the next item

                      Object.keys(nextItem).forEach((nextKey) => {
                          if (nextItem[nextKey] && nextItem[nextKey].loadCaseName && nextItem[nextKey].sign && nextItem[nextKey].factor) {
                              temp.push({
                                  loadCaseName: nextItem[nextKey].loadCaseName,
                                  sign: nextItem[nextKey].sign,
                                  factor: nextItem[nextKey].factor,
                              });
                          }
                      });
                      tempArray.push(temp);
                      nextSubArray[nextItemIndex] = null;
                  }
              });
          }
          additionalArray.push(tempArray);
          loadCaseNames = [];
      });
      addObj.push(additionalArray.length > 0 ? additionalArray : tempArray);
  });
  console.log(addObj);
  return addObj;
}
  processObject(inputObj);
  console.log(eitherArray);
  console.log(addObj);
  eitherArray = multipleFactor(eitherArray);
  addObj = multipleFactor(addObj);
  console.log({ addObj, eitherArray });
  return { eitherArray, addObj };
}
function findStrengthCombinations(combinations) {
  return combinations.filter(combo => combo.active === "Strength");
}

function generateBasicCombinations(loadCombinations) {
  const strengthCombinations = findStrengthCombinations(loadCombinations);
  if (strengthCombinations.length === 0) {
    console.error("No combinations with active set to 'Strength' found.");
    return [];
  }
  const allFinalCombinations = [];
  // Iterate over each strengthCombination
  for (const strengthCombination of strengthCombinations) {
    const type = strengthCombination.type;
    let factorCombinations = [];
    const factorArray = [];
    // Iterate over each loadCase within the strengthCombination
    for (const loadCase of strengthCombination.loadCases) {
      const factors = [];
      for (let factor = 1; factor <= 5; factor++) {
        const factorKey = `factor${factor}`;
        if (factorKey in loadCase) {
          // Extract the specific factor value
          const factorValue = loadCase[factorKey];
          factors.push({ factor, value: factorValue }); 
        } else {
          factors.push({ factor, value: 1 });
        }
        // Check if all factors are undefined, and if so, set factor1 to 1
        const allFactorsUndefined = factors.every(f => f.value === undefined);
      if (allFactorsUndefined) {
          const factor1 = factors.find(f => f.factor === 1);
          if (factor1) {
            factor1.value = 1;
      }
      }      
    }
    const sign = loadCase.sign || '+';
    console.log(factors);
        // Call createCombinations with the current factor
        // const factorIndexArray = [];
        for (let factor = 1; factor <= 5; factor++) {
          const factorObject = factors.find(f => f.factor === factor);
          // Check if the factor value is defined
        if (factorObject && factorObject.value !== undefined) {
          const new_11 = createCombinations(loadCase, strengthCombination, loadCombinations, loadNames, [], factorObject.value, factor,sign);
          console.log(new_11);
            // Combine and permute the results
          const result11 = combineAddEither([new_11]);
          console.log(result11);
          const finalCombinations_sign = permutation_sign(result11);  
          console.log(finalCombinations_sign);
          const fact = join_factor(finalCombinations_sign);
          console.log(fact);
          factorCombinations.push(fact);
        }
      }
    }
    console.log(factorCombinations);
    // Push the combinations for this strengthCombination to allFinalCombinations
    const joinedCombinations = join(factorCombinations);
    console.log(joinedCombinations);
    // allFinalCombinations.push(joinedCombinations);
    if (type === 'Add') {
      const joinedComb = [];
    
      // Recursive helper function to generate combinations from joinArray
      function combineArrays(arrays, index = 0, currentCombination = []) {
        if (index === arrays.length) {
          // If we've combined arrays from all groups, push the result
          joinedComb.push([...currentCombination]);
          return;
        }
    
        // For each array in the current group of arrays (arrays[index])
        for (const subArray of arrays[index]) {
          // Combine the current subArray with the ongoing combination
          currentCombination.push(...subArray);
    
          // Recurse into the next group of arrays
          combineArrays(arrays, index + 1, currentCombination);
    
          // Backtrack to explore other combinations
          currentCombination.length -= subArray.length;
        }
      }
      combineArrays(joinedCombinations);
    
      allFinalCombinations.push(joinedComb);
    }
    if (type === "either") {
      const concatenatedArray = joinedCombinations.flat(); 
      console.log(concatenatedArray);
    }
}
  console.log(allFinalCombinations);
  return allFinalCombinations;
}
// function join_factor(finalCombinations_sign) {
//   // Helper function to recursively flatten nested arrays
//   const deepFlatten = (arr) => {
//     return Array.isArray(arr)
//       ? arr.reduce((flat, item) => flat.concat(deepFlatten(item)), [])
//       : [arr];
//   };
//   // Ensure finalCombinations_sign is an object
//   if (typeof finalCombinations_sign === 'object' && finalCombinations_sign !== null) {
//     // Destructure addObj and eitherArray from finalCombinations_sign
//     const { addObj, eitherArray } = finalCombinations_sign;
//     let flattenedEitherArray = [];
//     let flattenedAddObj = [];
//     // Recursively flatten the eitherArray if present
//     if (Array.isArray(eitherArray)) {
//       flattenedEitherArray = deepFlatten(eitherArray);
//     }

//     // Recursively flatten the addObj if present
//     if (Array.isArray(addObj)) {
//       flattenedAddObj = deepFlatten(addObj);
//     }
//     // Log to verify the flattened arrays
//     console.log("Deep Flattened eitherArray:", flattenedEitherArray);
//     console.log("Deep Flattened addObj:", flattenedAddObj);
//     // Combine factors from both arrays into a single object
//     const combinedResults = {};
//     const combineFactors = (items) => {
//       let combinedResult = {};

//       items.forEach(item => {
//         // Only process objects with loadCaseName and factor properties
//         if (item && typeof item === 'object' && item.loadCaseName && item.factor) {
//           const key = `${item.loadCaseName}|${item.sign}`; // Unique key based on loadCaseName and sign

//           if (!combinedResult[key]) {
//             // If the entry does not exist, create it
//             combinedResult[key] = {
//               loadCaseName: item.loadCaseName,
//               sign: item.sign,
//               factor: Array.from({ length: 5 }, () => Array(5).fill(undefined)) // Initialize 5x5 array with undefined
//             };
//           }

//           // Check if item.factor is defined and is an array
//           if (Array.isArray(item.factor) && item.factor.length > 0) {
//             item.factor.forEach((innerArray, index) => {
//               if (Array.isArray(innerArray) && innerArray.length === 5) {
//                 innerArray.forEach((value, factorIndex) => {
//                   if (value !== undefined) {
//                     combinedResult[key].factor[index][factorIndex] = value; // Fill in the combined factors
//                   }
//                 });
//               } else {
//                 console.warn(`Inner array in factor is not a valid array for key: ${key}`, innerArray);
//               }
//             });
//           } else {
//             console.warn(`item.factor is not a valid array for key: ${key}`, item);
//           }
//         }
//       });

//       // Merge the combined result into the global combinedResults
//       Object.keys(combinedResult).forEach(key => {
//         if (!combinedResults[key]) {
//           combinedResults[key] = combinedResult[key];
//         } else {
//           // Merge factors if the key already exists
//           combinedResult[key].factor.forEach((innerArray, index) => {
//             innerArray.forEach((value, factorIndex) => {
//               if (value !== undefined) {
//                 combinedResults[key].factor[index][factorIndex] = value;
//               }
//             });
//           });
//         }
//       });
//     };

//     // Process each item in flattenedEitherArray
//     flattenedEitherArray.forEach(item => {
//       // Log the processing of each eitherArray item
//       console.log("Processing eitherArray item:", item);
//       // Call combineFactors to merge the factor arrays
//       combineFactors(Array.isArray(item) ? item.flat(1) : [item]);
//     });

//     // Process each item in flattenedAddObj
//     flattenedAddObj.forEach(item => {
//       // Log the processing of each addObj item
//       console.log("Processing addObj item:", item);
//       // Call combineFactors to merge the factor arrays
//       combineFactors(Array.isArray(item) ? item.flat(1) : [item]);
//     });

//     // Convert the combined results back to an array
//     const finalCombinedArray = Object.values(combinedResults);

//     // Log the final combined results
//     console.log("Final Combined Results:", finalCombinedArray);

//     // Return the final combined results for further processing
//     return finalCombinedArray;
//   } else {
//     console.error("finalCombinations_sign is not an object or is null:", finalCombinations_sign);
//   }
// }
// function join_factor(finalCombinations_sign) {
//   // Helper function to recursively flatten nested arrays
//   const deepFlatten = (arr) => {
//     if (Array.isArray(arr)) {
//       return arr.reduce((flat, item) => {
//         if (Array.isArray(item)) {
//           // If the item is an array, flatten it individually
//           return flat.concat(deepFlatten(item));
//         } else {
//           // Otherwise, just add the item
//           return flat.concat(item);
//         }
//       }, []);
//     } else {
//       return [arr];
//     }
//   };

//   // Recursive helper function to merge factor arrays regardless of their dimensionality
//   const mergeFactors = (target, source) => {
//     if (Array.isArray(source)) {
//       for (let i = 0; i < source.length; i++) {
//         if (Array.isArray(source[i])) {
//           // Ensure the target array exists and is initialized at this depth
//           if (!target[i]) {
//             target[i] = [];
//           }
//           // Recursively merge deeper dimensions
//           mergeFactors(target[i], source[i]);
//         } else {
//           // At the deepest level, copy non-undefined values from the source
//           if (source[i] !== undefined) {
//             target[i] = source[i];
//           }
//         }
//       }
//     }
//   };

//   // Ensure finalCombinations_sign is an object
//   if (typeof finalCombinations_sign === 'object' && finalCombinations_sign !== null) {
//     // Destructure addObj and eitherArray from finalCombinations_sign
//     const { addObj, eitherArray } = finalCombinations_sign;
//     let flattenedEitherArray = [];
//     let flattenedAddObj = [];

//     // Recursively flatten the eitherArray if present
//     if (Array.isArray(eitherArray)) {
//       eitherArray.forEach(arr => {
//         if (Array.isArray(arr)) {
//           // If arr contains multiple arrays, flatten each sub-array separately
//           arr.forEach(subArr => {
//             if (Array.isArray(subArr)) {
//               flattenedEitherArray.push(deepFlatten(subArr)); // Flatten sub-arrays individually
//             } else {
//               flattenedEitherArray.push(subArr); // Push non-array items directly
//             }
//           });
//         } else {
//           flattenedEitherArray.push(arr); // Push non-array items directly
//         }
//       });
//     }

//     // Flatten each array inside addObj individually
//     if (Array.isArray(addObj)) {
//       addObj.forEach(arr => {
//         if (Array.isArray(arr)) {
//           // If arr contains multiple arrays, flatten each sub-array separately
//           arr.forEach(subArr => {
//             if (Array.isArray(subArr)) {
//               flattenedAddObj.push(deepFlatten(subArr)); // Flatten sub-arrays individually
//             } else {
//               flattenedAddObj.push(subArr); // Push non-array items directly
//             }
//           });
//         } else {
//           flattenedAddObj.push(arr); // Push non-array items directly
//         }
//       });
//     }

//     // Log to verify the flattened arrays
//     console.log("Deep Flattened eitherArray:", flattenedEitherArray);
//     console.log("Deep Flattened addObj:", flattenedAddObj);

//     // Combine factors from both arrays into a single object
//     const combinedResults = {};
//     const combineFactors = (items) => {
//       let combinedResult = {};

//       items.forEach(item => {
//         // Only process objects with loadCaseName and factor properties
//         if (item && typeof item === 'object' && item.loadCaseName && item.factor) {
//           const key = `${item.loadCaseName}|${item.sign}`; // Unique key based on loadCaseName and sign

//           if (!combinedResult[key]) {
//             // If the entry does not exist, create it
//             combinedResult[key] = {
//               loadCaseName: item.loadCaseName,
//               sign: item.sign,
//               factor: [] 
//             };
//           }
//           // Merge factors, regardless of their dimensionality
//           mergeFactors(combinedResult[key].factor, item.factor);
//         }
//       });
//       Object.keys(combinedResult).forEach(key => {
//         if (!combinedResults[key]) {
//           combinedResults[key] = combinedResult[key];
//         } else {
//           // Merge factors if the key already exists
//           mergeFactors(combinedResults[key].factor, combinedResult[key].factor);
//         }
//       });
//     };

//     // Process each item in flattenedEitherArray
//     flattenedEitherArray.forEach(item => {
//       console.log("Processing eitherArray item:", item);
//       combineFactors(Array.isArray(item) ? item.flat(1) : [item]);
//     });

//     // Process each item in flattenedAddObj
//     flattenedAddObj.forEach(item => {
//       console.log("Processing addObj item:", item);
//       combineFactors(Array.isArray(item) ? item.flat(1) : [item]);
//     });

//     // Convert the combined results back to an array
//     const finalCombinedArray = Object.values(combinedResults);

//     // Log the final combined results
//     console.log("Final Combined Results:", finalCombinedArray);
    
//     // Return the final combined results for further processing
//     return finalCombinedArray;
//   } else {
//     console.error("finalCombinations_sign is not an object or is null:", finalCombinations_sign);
//   }
// }
function join_factor(finalCombinations_sign) {
  // Helper function to recursively flatten nested arrays
  const deepFlatten = (arr) => {
    if (Array.isArray(arr)) {
      return arr.reduce((flat, item) => {
        if (Array.isArray(item)) {
          // If the item is an array, flatten it individually
          return flat.concat(deepFlatten(item));
        } else {
          // Otherwise, just add the item
          return flat.concat(item);
        }
      }, []);
    } else {
      return [arr];
    }
  };

  // Recursive helper function to merge factor arrays regardless of their dimensionality
  const mergeFactors = (target, source) => {
    if (Array.isArray(source)) {
      for (let i = 0; i < source.length; i++) {
        if (Array.isArray(source[i])) {
          // Ensure the target array exists and is initialized at this depth
          if (!target[i]) {
            target[i] = [];
          }
          // Recursively merge deeper dimensions
          mergeFactors(target[i], source[i]);
        } else {
          // At the deepest level, copy non-undefined values from the source
          if (source[i] !== undefined) {
            target[i] = source[i];
          }
        }
      }
    }
  };

  // Ensure finalCombinations_sign is an object
  if (typeof finalCombinations_sign === 'object' && finalCombinations_sign !== null) {
    // Destructure addObj and eitherArray from finalCombinations_sign
    const { addObj, eitherArray } = finalCombinations_sign;
    let flattenedEitherArray = [];
    let flattenedAddObj = [];

    // Flatten each array inside eitherArray individually
    if (Array.isArray(eitherArray)) {
      eitherArray.forEach(arr => {
        if (Array.isArray(arr)) {
          arr.forEach(subArr => {
            if (Array.isArray(subArr)) {
              flattenedEitherArray.push(deepFlatten(subArr)); // Flatten sub-arrays individually
            } else {
              flattenedEitherArray.push(subArr); // Push non-array items directly
            }
          });
        } else {
          flattenedEitherArray.push(arr); // Push non-array items directly
        }
      });
    }

    // Flatten each array inside addObj individually
    // if (Array.isArray(addObj)) {
    //   addObj.forEach(arr => {
    //     if (Array.isArray(arr)) {
    //       arr.forEach(subArr => {
    //         if (Array.isArray(subArr)) {
    //           flattenedAddObj.push(deepFlatten(subArr)); // Flatten sub-arrays individually
    //         } else {
    //           flattenedAddObj.push(subArr); // Push non-array items directly
    //         }
    //       });
    //     } else {
    //       flattenedAddObj.push(arr); // Push non-array items directly
    //     }
    //   });
    // }
    // Log to verify the individually flattened arrays
    console.log("Individually Flattened eitherArray:", flattenedEitherArray);
    console.log("Individually Flattened addObj:", flattenedAddObj);

    // Combine factors from both arrays into a single object
    const combinedResults = {};
    const combineFactors = (items) => {
      let combinedResult = {};

      items.forEach(item => {
        // Only process objects with loadCaseName and factor properties
        if (item && typeof item === 'object' && item.loadCaseName && item.factor) {
          const key = `${item.loadCaseName}|${item.sign}`; // Unique key based on loadCaseName and sign

          if (!combinedResult[key]) {
            // If the entry does not exist, create it
            combinedResult[key] = {
              loadCaseName: item.loadCaseName,
              sign: item.sign,
              factor: []
            };
          }
          // Merge factors, regardless of their dimensionality
          mergeFactors(combinedResult[key].factor, item.factor);
        }
      });

      Object.keys(combinedResult).forEach(key => {
        if (!combinedResults[key]) {
          combinedResults[key] = combinedResult[key];
        } else {
          // Merge factors if the key already exists
          mergeFactors(combinedResults[key].factor, combinedResult[key].factor);
        }
      });

      // Return the combined result for this item set
      return combinedResult;
    };

    // const commonArray_Add = [];
    const commonArray_Either = [];
    flattenedEitherArray.forEach(item => {
      let result = [];
      console.log("Processing eitherArray item:", item);
      const combined = combineFactors(Array.isArray(item) ? item : [item]); // Call combineFactors for the item directly
      result.push(combined); // Push the result into the result array
      commonArray_Either.push(result); // Push the result array into the common array as a sub-array
    });
    // flattenedAddObj.forEach(item => {
    //   let result = [];
    //   console.log("Processing addObj item:", item);
    //   const combined = combineFactors(Array.isArray(item) ? item : [item]); 
    //   result.push(combined); // Push the result into the result array
    //   commonArray_Add.push(result); // Push the result array into the common array as a sub-array
    // });
//     const commonArray_Add = [];
// if (Array.isArray(addObj)) {
//   const addObjLength = addObj.length;
//   for (let i = 0; i < addObjLength; i++) {
//     const currentArray = addObj[i];
//     if (Array.isArray(currentArray)) {
//       // Create an object to hold the merged results
//       let result = {};
      
//       // Check the length of the first item in currentArray to determine how many inner arrays to process
//       const innerArrayLength = currentArray[0].length;

//       // Loop through each index of the inner arrays
//       for (let j = 0; j < innerArrayLength; j++) {
//         // Create a new array to hold the joined factors for this index
//         let joinedFactors = [];

//         // Loop through each item in currentArray
//         for (let k = 0; k < currentArray.length; k++) {
//           const item = currentArray[k];

//           // Process only if the item has a loadCaseName and factor
//           if (item && item.loadCaseName && item.factor) {
//             const key = `${item.loadCaseName}|${item.sign}`;
//             if (!result[key]) {
//               result[key] = {
//                 loadCaseName: item.loadCaseName,
//                 sign: item.sign,
//                 factor: []
//               };
//             }
            
//             // Ensure the factor array exists for this index
//             if (!result[key].factor[j]) {
//               result[key].factor[j] = []; // Initialize if undefined
//             }
//             // Join the corresponding inner array from the item
//             if (Array.isArray(item.factor[j])) {
//               result[key].factor[j] = result[key].factor[j].concat(item.factor[j]);
//             }
//           }
//         }
//       }

//       // Push the result for each processed outer array in addObj
//       commonArray_Add.push(result);
//     }
//   }
// }

    // console.log("Final Common Array of Results: Add", commonArray_Add);
    console.log("Final Common Array of Results: Either", commonArray_Either);
    return {
      add: addObj,
      either: commonArray_Either
    };
  } else {
    console.error("finalCombinations_sign is not an object or is null:", finalCombinations_sign);
  }
}

function join(factorCombinations) {
  const joinArray = [];
  const allFinalCombinations = [];
  for (const combination of factorCombinations) {
    const join = [];
    const { add, either } = combination; 

    const eitherJoin = [];
   
   function getSingleFactor(factor, index) {
    // Check if factor is a valid 2D array
    // if (Array.isArray(factor) && Array.isArray(factor[index])) {
      
      // Loop through indices from 0 to 4 and check each one
      for (let i = 0; i <= 4; i++) {
        if (factor.length > i && factor[i].length > index) {
          const value = factor[i][index]; // Accessing factor[i][index]
  
          // If value is an array, recursively call getSingleFactor using the same index (i)
          if (Array.isArray(value)) {
            const nvalue = factor[i][i]
            return getSingleFactor([nvalue], index); // Corrected to pass 'i' instead of 0
          }
  
          return value; // Return the non-array value
        }
      }
    // }
    return undefined; // Return undefined if no valid factor is found
  }
  
// Function to extract loadCaseName, sign, and a specific factor based on index
function extractFactorsFromObject(factorObj, index) {
  const extractedFactors = [];
  
  // Iterate through each key in factorObj
  for (const key in factorObj) {
    if (factorObj.hasOwnProperty(key)) {
      const { loadCaseName, sign, factor } = factorObj[key];
      const factorValue = getSingleFactor(factor, index); // Get factor[0][index]
      
      // Push the extracted values into the result array
      if (factorValue != undefined) {
      extractedFactors.push({ loadCaseName, sign, factor: factorValue });
      }
    }
  }

  return extractedFactors; // Return all extracted factors from this object
}

// Function to combine matching factors (one factor at a time) from 'either'
function combineMatchingFactors(either, factorIndex) {
  const combinedResult = [];

  // Extract the single factor based on factorIndex from each array in 'either'
  const extractedFactors = either.map(arr => {
    return arr.flatMap(factorObj => {
      return extractFactorsFromObject(factorObj, factorIndex); // Extract and return key-value pairs for the current factorIndex
    });
  });

  // Recursive function to generate combinations
  function generateCombinations(arrays, temp = [], index = 0) {
    if (index === arrays.length) {
      combinedResult.push([...temp]); // Push a copy of the current combination
      return;
    }

    for (const item of arrays[index]) {
      temp.push(item); // Add item to the temporary combination
      generateCombinations(arrays, temp, index + 1); // Recurse to the next array
      temp.pop(); // Remove the item after the recursion
    }
  }

  generateCombinations(extractedFactors);
  return combinedResult;
}

// Updated combineLoadCases function to loop through factors 0 to 4
function combineLoadCases(either,add) {
  const allCombinations = [];

  // Loop through factor indices (0 to 4) to process one factor at a time
  for (let factorIndex = 0; factorIndex < 5; factorIndex++) {
    const factorCombinations = combineMatchingFactors(either, factorIndex); // Get factor combinations for the current index
    // Iterate through each array in 'add' object
    console.log(factorCombinations);
    add.forEach(addArray => {
      // Check if it's an array and contains subarrays
      if (addArray.length != 0) {
        const subArray = addArray[0][factorIndex]; // Get the subarray corresponding to the current factorIndex
        
        if (Array.isArray(subArray)) {
          // Now combine the subArray elements with the factorCombinations
          subArray.forEach(item => {
            factorCombinations.forEach(factorCombination => {
              const combinedResult = [...factorCombination, item].flat(); // Combine factorCombination with sub-array item
              allCombinations.push(combinedResult);
            });
          });
        }
      }
    });
    // allCombinations.push(...factorCombinations);
  }
  
  console.log(allCombinations);
  return allCombinations;
}

if (either && either.length > 0) {
  const combined = combineLoadCases(either,add);
  console.log(combined);
  // Push combined results
  eitherJoin.push(...combined);
  console.log(eitherJoin);
  join.push(eitherJoin);
  joinArray.push(join[0]);
}


      // Loop through each array in addObj (or addCombination)
      // if (eitherJoin.length > 0) {
      //   for (const eitherCombination of eitherJoin) {
      //     // Loop through each array in addObj (or addCombination)
      //     for (let addCombination of add) {
      //       // Remove empty arrays in addCombination
      //       addCombination = addCombination.filter(innerArray => innerArray.length > 0);
      
      //       // Iterate over each inner array in addCombination
      //       for (let innerArray of addCombination) {
      //         // Remove empty arrays in innerArray
      //         innerArray = innerArray.filter(subArray => subArray.length > 0);
      //         // Iterate over each subArray in innerArray
      //         for (let subArray of innerArray) {
      //           // Remove empty arrays in subArray
      //           subArray = subArray.filter(item => item.length > 0);
      
      //           // Iterate over each item in subArray
      //           for (const item of subArray) {
      //             // Combine each item with eitherCombination
      //             const finalCombination = [...item, ...eitherCombination];
      //             join.push(finalCombination); // Push the final combination into join array
      //           }
      //         }
      //       }
      //     }
      //   }
      // }
      
    if (eitherJoin.length == 0) {
      for (const addCombination of add) {
          // Check if addCombination is not empty
          if (addCombination.length > 0) {
              // Iterate over each inner array in addCombination
              for (const innerArray of addCombination) {
                  // Check if innerArray is not empty
                  if (innerArray.length > 0) {
                      // Iterate over each subArray in innerArray
                      for (const subArray of innerArray) {
                          // Check if subArray is not empty and if it contains multiple arrays
                          if (Array.isArray(subArray[0])) {
                              // Iterate over each item in subArray if it contains multiple arrays
                              for (const item of subArray) {
                                  // Push the item (which is an array itself) into join
                                  join.push([...item]);
                              }
                              } else {
                              // If subArray does not contain multiple arrays, push it directly
                              join.push([...subArray]);
                          }
                      }
                  }
              }
          }
      }
      // const finalCombinations = [];

      // // Recursive function to generate combinations based on corresponding factors
      // function generateFactorCombinations(index, currentCombination) {
      //   if (index === join[0].length) {
      //     // Base case: push the full combination when we've processed all factors
      //     finalCombinations.push([...currentCombination]);
      //     return;
      //   }
    
      //   // Iterate through each array in `join` to combine corresponding factors (index-based)
      //   for (let i = 0; i < join.length; i++) {
      //     const factorToCombine = join[i][index]; // Take factor at current index
    
      //     // Add this factor to the current combination
      //     currentCombination.push(factorToCombine);
    
      //     // Move to the next factor index (corresponding to factor2, factor3, etc.)
      //     generateFactorCombinations(index + 1, currentCombination);
    
      //     // Remove the last added factor (backtrack for next iteration)
      //     currentCombination.pop();
      //   }
      // }
    
      // // Start the combination generation process
      // generateFactorCombinations(0, []);
    
      // // Now `finalCombinations` contains all combinations where only corresponding factors are combined
      // console.log(finalCombinations);
    
    function extractCombinationsByFactor(join) {
      const allCombinations = [];
    
      // Flatten the structure and extract factors
      const flattened = [];
      join.forEach(innerArray => {
        innerArray.forEach(item => {
          flattened.push(item); // Push each object with loadCaseName, sign, and factor
        });
      });
    
      // Now `flattened` contains all the objects, we will create factor combinations for each index
      for (let factorIndex = 0; factorIndex < 5; factorIndex++) {
        const currentFactorCombination = [];
    
        // Extract the factorIndex value from each object's factor array
        flattened.forEach(item => {
          const factorValue = item.factor[factorIndex];
          if (factorValue !== 0) {// Get factor at the current index
          const combinedResult = {
            loadCaseName: item.loadCaseName,
            sign: item.sign,
            factor: factorValue // Only take the specific factor
          };
        
          currentFactorCombination.push(combinedResult); // Add the result to the combination array
       } });
    
        // Push the current factor combination array to allCombinations
        if (currentFactorCombination.length > 0) {
          allCombinations.push(currentFactorCombination);
        }
      }
    
      return allCombinations;
    }
    console.log(join);
    joinArray.push(extractCombinationsByFactor(join));
    console.log(joinArray);
  }
}
  console.log(joinArray);
  return joinArray; // Return the array of all combined results
}

function permutation_sign(result11) {
  const { addObj, eitherArray } = result11;
  let finalCombinations = [];
  
  function generateCombinations(arrays) {
    const results = [];
    function recurse(currentCombo, depth) {
      if (depth === arrays.length) {
        results.push([...currentCombo]);
        return;
      }
      for (let i = 0; i < arrays[depth].length; i++) {
        currentCombo.push(arrays[depth][i]);
        recurse(currentCombo, depth + 1);
        currentCombo.pop();
      }
    }
    recurse([], 0);
    return results;
  }
  for (let addArrIndex = 0; addArrIndex < addObj.length; addArrIndex++) {
    let addArr = addObj[addArrIndex]; 
    for (let innerArrIndex = 0; innerArrIndex < addArr.length; innerArrIndex++) {
      let innerArr = addArr[innerArrIndex];      
      for (let objIndex = 0; objIndex < innerArr.length; objIndex++) {
        let obj = innerArr[objIndex];
        let positiveArray = [];
        let negativeArray = [];
        let dummyArray = [];
        let dummy = [];
        let new_temp = [];
        let temp = [];

        for (const item of obj) {
          dummy = [];
          if (item.sign === "+,-" || item.sign === "-,+") {
            const positiveObj = { ...item, sign: "+" };
            const negativeObj = { ...item, sign: "-" };
            positiveArray.push(positiveObj);
            negativeArray.push(negativeObj);
          } else if (item.sign === "±") {
            const positiveObj = { ...item, sign: "+" };
            const negativeObj = { ...item, sign: "-" };
            dummy.push(positiveObj);
            dummy.push(negativeObj);
            dummyArray.push(dummy);
          } else {
            new_temp.push({ ...item });
          }
        }

        if (dummyArray.length > 0) {
          const combinations = generateCombinations(dummyArray);
          
          if (positiveArray.length > 0 && negativeArray.length > 0) {
            for (const combination of combinations) {
              const combinedWithPositive = [...positiveArray, ...combination];
              const combinedWithNegative = [...negativeArray, ...combination];

              if (new_temp.length > 0) {
                for (const newItem of new_temp) {
                  const newItemArray = Array.isArray(newItem) ? newItem : [newItem];
                  temp.push([...combinedWithPositive, ...newItemArray]);
                  temp.push([...combinedWithNegative, ...newItemArray]);
                }
              } else {
                temp.push(combinedWithPositive);
                temp.push(combinedWithNegative);
              }
            }
          } else {
            for (const combination of combinations) {
              if (new_temp.length > 0) {
                for (const newItem of new_temp) {
                  temp.push([...combination, ...newItem]);
                }
              } else {
                temp.push(combination);
              }
            }
          }
        } else {
          if (new_temp.length > 0) {
            for (const newItem of new_temp) {
              if (positiveArray.length > 0 && negativeArray.length > 0) {
                temp.push([...positiveArray, ...newItem]);
                temp.push([...negativeArray, ...newItem]);
              } else {
                temp.push(newItem);
              }
            }
          } else {
            if (positiveArray.length > 0) {
              temp.push([...positiveArray]);
            }
            if (negativeArray.length > 0) {
              temp.push([...negativeArray]);
            }
          }
        }
        if (temp.length === 0) {
          innerArr.splice(objIndex, 1); // Remove the empty obj from innerArr
          objIndex--; // Adjust the index after removal to avoid skipping elements
        } else {
          obj.length = 0;
          obj.push(...temp); // Push modified combinations to obj
        }
      }
    }
  }
  if (eitherArray !== undefined) {
  for (let eitherArrIndex = 0; eitherArrIndex < eitherArray.length; eitherArrIndex++) {
    let eitherArr = eitherArray[eitherArrIndex]; 
    for (let innerArrIndex = 0; innerArrIndex < eitherArr.length; innerArrIndex++) {
      let innerArr = eitherArr[innerArrIndex]; 
      
      for (let objIndex = 0; objIndex < innerArr.length; objIndex++) {
        let obj = innerArr[objIndex];
        let positiveArray = [];
        let negativeArray = [];
        let dummyArray = [];
        let dummy = [];
        let new_temp = [];
        let temp = [];

        for (const item of obj) {
          dummy = [];
          if (item.sign === "+,-" || item.sign === "-,+") {
            const positiveObj = { ...item, sign: "+" };
            const negativeObj = { ...item, sign: "-" };
            positiveArray.push(positiveObj);
            negativeArray.push(negativeObj);
          } else if (item.sign === "±") {
            const positiveObj = { ...item, sign: "+" };
            const negativeObj = { ...item, sign: "-" };
            dummy.push(positiveObj);
            dummy.push(negativeObj);
            dummyArray.push(dummy);
          } else {
            new_temp.push({ ...item });
          }
        }

        if (dummyArray.length > 0) {
          const combinations = generateCombinations(dummyArray);  
          if (positiveArray.length > 0 && negativeArray.length > 0) {
            for (const combination of combinations) {
              const combinedWithPositive = [...positiveArray, ...combination];
              const combinedWithNegative = [...negativeArray, ...combination];

              if (new_temp.length > 0) {
                for (const newItem of new_temp) {
                  const newItemArray = Array.isArray(newItem) ? newItem : [newItem];
                  temp.push([...combinedWithPositive, ...newItemArray]);
                  temp.push([...combinedWithNegative, ...newItemArray]);
                }
              } else {
                temp.push(combinedWithPositive);
                temp.push(combinedWithNegative);
              }
            }
          } else {
            for (const combination of combinations) {
              if (new_temp.length > 0) {
                for (const newItem of new_temp) {
                  temp.push([...combination, ...newItem]);
                }
              } else {
                temp.push(combination);
              }
            }
          }
        } else {
          if (new_temp.length > 0) {
            for (const newItem of new_temp) {
              if (positiveArray.length > 0 && negativeArray.length > 0) {
                temp.push([...positiveArray, ...newItem]);
                temp.push([...negativeArray, ...newItem]);
              } else {
                temp.push(newItem);
              }
            }
          } else {
            if (positiveArray.length > 0) {
              temp.push([...positiveArray]);
            }
            if (negativeArray.length > 0) {
              temp.push([...negativeArray]);
            }
          }
        }
        if (temp.length === 0) {
          innerArr.splice(objIndex, 1); // Remove the empty obj from innerArr
          objIndex--; // Adjust the index after removal to avoid skipping elements
        } else {
          obj.length = 0;
          obj.push(...temp); // Push modified combinations to obj
        }
      }
    }
  }
  }
  console.log({ addObj, eitherArray });
  return { addObj, eitherArray };
}
function Generate_Load_Combination() {
  const basicCombinations = generateBasicCombinations(loadCombinations);
  console.log(basicCombinations);
  const uniqueCombinations = [...new Set(basicCombinations)];
  console.log(uniqueCombinations);
}
const toggleExcelReader = () => {
  fileInputRef.current.click();
};
const [loadCombinations, setLoadCombinations] = useState([{ loadCombination: '', active: '', type: '', loadCases: [{
  loadName: '',
  sign: '',
  factor1: '',
  factor2: '',
  factor3: '',
  factor4: '',
  factor5: ''
}]}]);
useEffect(() => {
  // Ensure there is always an additional empty row at the end
  const lastCombination = loadCombinations[loadCombinations.length - 1];
  if (lastCombination && (
    lastCombination.loadCombination !== '' || 
    lastCombination.active !== '' || 
    lastCombination.type !== '' || 
    lastCombination.loadCases.some(loadCase => (
      loadCase.loadName !== '' ||
      loadCase.sign !== '' ||
      loadCase.factor1 !== '' ||
      loadCase.factor2 !== '' ||                  
      loadCase.factor3 !== '' ||
      loadCase.factor4 !== '' ||
      loadCase.factor5 !== ''
    ))
  )) {
    setLoadCombinations([
      ...loadCombinations, 
      {
        loadCombination: '',
        active: '',
        type: '',
        loadCases: [{
          loadName: '',
          sign: '',
          factor1: '',
          factor2: '',
          factor3: '',
          factor4: '',
          factor5: ''
        }]
      }
    ]);
    setInputValue('');
  }
}, [loadCombinations]);
const handleFileChange = (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    const binaryStr = e.target.result;
    const workbook = XLSX.read(binaryStr, { type: 'binary' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log('Raw JSON Data:', jsonData); // Log raw JSON data

    // Convert each row to an object and store in loadCombinations
    const formattedData = [];
    let currentLoadCombination = null;

    jsonData.slice(1).forEach(row => {
      const loadCombination = row[0] || currentLoadCombination.loadCombination;
      const active = row[1] || currentLoadCombination.active;
      const type = row[2] || currentLoadCombination.type;
      const loadCaseName = row[3];
      const sign = row[4];
      const factor1 = row[5];
      const factor2 = row[6];
      const factor3 = row[7];
      const factor4 = row[8];
      const factor5 = row[9];

      if (loadCombination) {
        if (!currentLoadCombination || currentLoadCombination.loadCombination !== loadCombination) {
          // Create a new loadCombination object
          currentLoadCombination = {
            loadCombination,
            active,
            type,
            loadCases: []
          };
          formattedData.push(currentLoadCombination);
        }

        // Add the load case to loadCombination's loadCases array
        currentLoadCombination.loadCases.push({
          loadCaseName,
          sign,
          factor1,
          factor2,
          factor3,
          factor4,
          factor5
        });
      }
    });

    console.log('Formatted Data:', formattedData); 
    setLoadCombinations(formattedData);
  };

  reader.readAsBinaryString(file);
};
console.log(loadCombinations);
const [activeDropdownIndex, setActiveDropdownIndex] = useState(-1); 

  const toggleDropdown = (index) => {
    setActiveDropdownIndex(index === activeDropdownIndex ? null : index);
  };
  const toggleTypeDropdown = (index) => {
    setTypeDropdownIndex(index === typeDropdownIndex ? null : index);
  };

  const handleOptionSelect = (index, option) => {
    handleLoadCombinationChange(index, 'active', option);
    setActiveDropdownIndex(null);
  };

  const handleTypeOptionSelect = (index, option) => {
    handleLoadCombinationChange(index, 'type', option);
    setTypeDropdownIndex(null);
  };

  const handleLoadCombinationChange = (index, field, value) => {
    setLoadCombinations((prevLoadCombinations) => {
      const updatedLoadCombinations = [...prevLoadCombinations];
      updatedLoadCombinations[index][field] = value;
      return updatedLoadCombinations;
    });
  };

  const debounce = (func, delay) => {
    let debounceTimer;
    return function (...args) {
      const context = this;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => func.apply(context, args), delay);
    };
  };
  const debouncedHandleLoadCombinationChange = useCallback(
    debounce((index, field, value) => {
      handleLoadCombinationChange(index, field, value);
    }, 1000),
    []
  );
  const handleInputChange = (index, field, value) => {
    setInputValue(value);
    debouncedHandleLoadCombinationChange(index, field, value);
    
  };
  React.useEffect(() => {
    if (
      !VerifyUtil.isExistQueryStrings("redirectTo") &&
      !VerifyUtil.isExistQueryStrings("mapiKey")
    ) {
      setDialogShowState(true);
    }
  }, []);
  console.log(loadNames);
  console.log(loadCombinations);
  const handleFactorChange = (combinationIndex, caseIndex, factorName, value) => {
    const updatedLoadCombinations = [...loadCombinations];
    updatedLoadCombinations[combinationIndex].loadCases[caseIndex][factorName] = value;
    setLoadCombinations(updatedLoadCombinations);
  };
  const LoadCaseComponent = ({ loadCase, loadCaseIndex, updateLoadCase }) => {
    // const handleFactorBlur = (index, factorKey, value) => {
    //   updateLoadCase(index, factorKey, value);
    // };
  
    const handleFactorClick = (e) => {
      const range = document.createRange();
      const sel = window.getSelection();
      range.selectNodeContents(e.currentTarget);
      sel.removeAllRanges();
      sel.addRange(range);
    }};
  
  
  //Main UI
  return (
	<div className="App" >
		{/* {showDialog && <MKeyDialog />}
		{showDialog && <VerifyDialog />} */}
    {showDialog && <VerifyDialog />}

		<GuideBox
			padding={2}
			center
		>
      {/* <div style={{ backgroundColor: '#d3d3d3', width: '830px', height: '500px', display: 'flex'}}> */}
      <Panel width="800px" height="540px" flexItem>
        {/* <div style={{ width: '300px', height: '500px', display: 'flex', flexDirection: 'column',margin:'10px'}}> */}
        <Panel width="300px" height="540px" variant="shadow2" marginLeft='20px'>
         <div style={{width: '130px', height: '20px', color: 'black',paddingTop:'2.5px'}}><Typography variant="h1" color="primary" size="small">
         Load Combination List
</Typography></div>
         <div style={{ display: 'flex', flexDirection: 'row', backgroundColor: 'white', color: 'black',fontSize:'12px',width:'280px', height: '20px',borderTopLeftRadius: '10px', borderTopRightRadius: '10px'}}>
         {/* <Panel width="280px" height="20px" variant="shadow2"> */}
         <div style={{ flex: '0 0 160px', paddingLeft:'2px' }}>Load Combination</div>
          <Sep direction='vertical' margin='2px'/>
         <div style={{ flex: '1 1 auto' }}>Active</div>
        <Sep direction='vertical' margin='2px'/>
        <div style={{ flex: '1 1 auto' }}>Type</div>
        </div>
      <div style={{
      width: '280px',
      height: '370px',
      backgroundColor: 'white',
      marginBottom: '20px',
      marginTop:'2px',
      borderTop: '2px solid #ccc', // Adds a greyish line to the top border
      boxShadow: '0px -4px 5px -4px grey' // Adds a shadow effect to the top border
    }}> 
    <Scrollbars height={360} width={280}>
               {loadCombinations.map((combo, index) => (
      <div key={index} style={{ display: 'flex', flexDirection: 'row', borderBottom: '1px solid #ccc', cursor: 'pointer', backgroundColor: selectedLoadCombinationIndex === index ? '#f0f0f0' : 'white' }} onClick={() => handleLoadCombinationClick(index)}>
        <div style={{ flex: '0 0 140px', padding: '5px', borderRight: '1px solid #ccc', color: 'black' }}>
          {/* <Typography>{combo.loadCombination}</Typography> */}
        {/* <input
                        type="text"
                        value={combo.loadCombination}
                        onChange={(e) => handleLoadCombinationChange(index, 'loadCombination', e.target.value)}
                        placeholder=" " 
                        style={{ width: '100%', border: 'none', outline: 'none', backgroundColor: 'transparent' }}
                      /> */}
                      {index === loadCombinations.length - 1 ? (
                        <input
                          type="text"
                          value={inputValue}
                          onChange={(e) =>
                            handleInputChange(index, 'loadCombination', e.target.value)
                          }
                          onBlur={() =>
                            handleLoadCombinationChange(index, 'loadCombination', inputValue)
                          }
                          placeholder=" "
                          style={{
                            width: '100%',
                            border: 'none',
                            outline: 'none',
                            backgroundColor: 'transparent',
                          }}
                        />
                      ) : (
                        <Typography>{combo.loadCombination}</Typography>
                      )}
             </div>
        {/* <div style={{ flex: '1 1 65px', padding: '5px', borderRight: '1px solid #ccc', color: 'black' }}><Typography>{combo.active}</Typography></div> */}
        <div
              style={{
                flex: '1 1 65px',
                padding: '5px',
                borderRight: '1px solid #ccc',
                color: 'black',
                cursor: 'pointer',
                position: 'relative'
              }}
              onClick={(e) => {
                e.stopPropagation();
                toggleDropdown(index);
              }}
            >
              <Typography>{combo.active}</Typography>
              {activeDropdownIndex === index && (
                <div
                  style={{
                    position: 'absolute',
                    backgroundColor: 'white',
                    border: '1px solid #ccc',
                    zIndex: 1,
                    top: '100%',
                    left: 0,
                    minWidth: '100%',
                  }}
                >
                  <div onClick={() => handleOptionSelect(index, 'Active')}><Typography>Active</Typography></div>
                  <div onClick={() => handleOptionSelect(index, 'Inactive')}><Typography>Inactive</Typography></div>
                  <div onClick={() => handleOptionSelect(index, 'Local')}><Typography>Local</Typography></div>
                  <div onClick={() => handleOptionSelect(index, 'Strength')}><Typography>Strength</Typography></div>
                  <div onClick={() => handleOptionSelect(index, 'Service')}><Typography>Service</Typography></div>
                </div>
                 )}
            </div>
        {/* <div style={{ flex: '1 1 40px', padding: '5px', color: 'black' }}><Typography>{combo.type}</Typography></div> */}
        <div
                      style={{
                        flex: '1 1 50px',
                        padding: '5px',
                        color: 'black',
                        cursor: 'pointer',
                        position: 'relative'
                      }}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleTypeDropdown(index);
                      }}
                    >
                      <Typography>{combo.type}</Typography>
                      {typeDropdownIndex === index && (
                        <div
                          style={{
                            position: 'absolute',
                            backgroundColor: 'white',
                            border: '1px solid #ccc',
                            zIndex: 1,
                            top: '100%',
                            left: 0,
                            right: 0
                          }}
                        >
                          {['Add', 'Either', 'Envelope'].map((option, optionIndex) => (
                            <div
                              key={optionIndex}
                              onClick={() => handleTypeOptionSelect(index, option)}
                              style={{
                                padding: '5px',
                                cursor: 'pointer',
                                backgroundColor: option === <Typography>combo.type</Typography> ? '#f0f0f0' : 'white'
                              }}
                            >
                              <Typography>{option}</Typography>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    </div>
                ))}
              </Scrollbars>
      </div>
      
    <CheckGroup>
  <Check name="Generate envelop load combinations in midas" />
  <Check name="Generate inactive load combinations in midas" />
</CheckGroup>
<ComponentsPanelTypographyDropList />
</Panel>

<Panel width={7500000} height={540} marginRight="20px">
 <div style={{display: 'flex',flexDirection:'row' ,justifyContent: 'space-between',width: '450px', height: '20px', color: 'black', fontSize: '12px',paddingTop:'2px',paddingBottom:'0px',marginBottom:'0px'}}>
  <Typography variant="h1" color="primary" size="small" textalign="centre">Load Cases & Factors</Typography> 
  <div style={{
  display: 'flex',
  alignItems: 'flex-end',
  marginTop: '3px', // Adjust margin-bottom as per your requirement
}}><ComponentsDialogHelpIconButton /></div>
  </div>
      <div style={{ display: 'flex', flexDirection: 'row', backgroundColor: 'white', color: 'black',fontSize:'12px', height: '20px',borderTopLeftRadius: '10px', borderTopRightRadius: '10px'}}>
      <div style={{ flex: '0 0 150px'}}>Load Case</div>
      <Sep direction='vertical' margin='2px'/>
      <div style={{ flex: '1 1 auto' }}>Sign</div>
      <Sep direction='vertical' margin='2px'/>
      <div style={{ flex: '1 1 auto' }}>Factor1</div>
      <Sep direction='vertical' margin='2px'/>
      <div style={{ flex: '1 1 auto' }}>Factor2</div>
      <Sep direction='vertical' margin='2px'/>
      <div style={{ flex: '1 1 auto' }}>Factor3</div>
      <Sep direction='vertical' margin='2px'/>
      <div style={{ flex: '1 1 auto' }}>Factor4</div>
      <Sep direction='vertical' margin='2px'/>
      <div style={{ flex: '1 1 auto' }}>Factor5</div>
      </div>
      <div style={{
      width: '450px',
      height: '450px',
      backgroundColor: 'white',
      marginBottom: '20px',
      marginTop:'2px',
      borderTop: '2px solid #ccc', // Adds a greyish line to the top border
      boxShadow: '0px -4px 5px -4px grey'
    }}>
              <Scrollbars height={450} width={460}>
  {selectedLoadCombinationIndex >= 0 && loadCombinations[selectedLoadCombinationIndex].loadCases.map((loadCase, loadCaseIndex) => (
    <div key={loadCaseIndex} style={{ display: 'flex', flexDirection: 'row', borderBottom: '1px solid #ccc' }}>
      <div style={{ flex: '0 0 132px', padding: '5px', borderRight: '1px solid #ccc', color: 'black', position: 'relative' }} onClick={(e) => { e.stopPropagation(); toggleLoadCaseDropdown(loadCaseIndex); }}>
        <Typography >
          {loadCase.loadCaseName}
        </Typography>
        {loadCaseDropdownIndex === loadCaseIndex && (
          <div style={{ position: 'absolute', backgroundColor: 'white', border: '1px solid #ccc', zIndex: 1, top: '100%', left: 0, right: 0 }}>
            {loadNames.map((name, nameIndex) => (
              <div key={nameIndex} onClick={() => handleLoadCaseOptionSelect(selectedLoadCombinationIndex, loadCaseIndex, name)} style={{ padding: '5px', cursor: 'pointer', backgroundColor: name === loadCase.loadCaseName ? '#f0f0f0' : 'white' }}>
                <Typography>{name}</Typography>
              </div>
            ))}
          </div>
        )}
      </div>
      {/* <div style={{ flex: '1 1 25px', padding: '5px', borderRight: '1px solid #ccc', color: 'black' }}><Typography>{loadCase.sign}</Typography></div> */}
      <div style={{ flex: '1 1 25px', padding: '5px', borderRight: '1px solid #ccc', color: 'black', position: 'relative' }} onClick={(e) => { e.stopPropagation(); toggleSignDropdown(loadCaseIndex); }}> 
        <Typography >
          {loadCase.sign}
        </Typography>
        {signDropdownIndex === loadCaseIndex && (
          <div style={{ position: 'absolute', backgroundColor: 'white', border: '1px solid #ccc', zIndex: 1, top: '100%', left: 0, right: 0 }}>
            {['+', '-', '+,-', '±'].map((signOption, signIndex) => (
              <div key={signIndex} onClick={() => handleSignOptionSelect(selectedLoadCombinationIndex, loadCaseIndex, signOption)} style={{ padding: '5px', cursor: 'pointer', backgroundColor: signOption === loadCase.sign ? '#f0f0f0' : 'white' }}>
                <Typography>{signOption}</Typography>
              </div>
            ))}
          </div>
        )}
      </div>
       <div style={{ flex: '1 1 30px', padding: '5px', borderRight: '1px solid #ccc', color: 'black', cursor: 'text' }} onBlur={(e) => handleFactorBlur(selectedLoadCombinationIndex, loadCaseIndex, 'factor1', e.currentTarget.textContent)}
  contentEditable
  suppressContentEditableWarning>
        <Typography>{loadCase.factor1 !== undefined ? loadCase.factor1 : " "}</Typography>
        </div>
        <div style={{ flex: '1 1 30px', padding: '5px', borderRight: '1px solid #ccc', color: 'black', cursor: 'text' }} onBlur={(e) => handleFactorBlur(selectedLoadCombinationIndex, loadCaseIndex, 'factor2', e.currentTarget.textContent)}
  contentEditable
  suppressContentEditableWarning>
        <Typography>{loadCase.factor2 !== undefined ? loadCase.factor2 : " "}</Typography>
        </div>
        <div style={{ flex: '1 1 30px', padding: '5px', borderRight: '1px solid #ccc', color: 'black', cursor: 'text' }}  onBlur={(e) => handleFactorBlur(selectedLoadCombinationIndex, loadCaseIndex, 'factor3', e.currentTarget.textContent)}
  contentEditable
  suppressContentEditableWarning>
        <Typography>{loadCase.factor3 !== undefined ? loadCase.factor3 : " "}</Typography>
        </div>
        <div style={{ flex: '1 1 30px', padding: '5px', borderRight: '1px solid #ccc', color: 'black', cursor: 'text' }}  onBlur={(e) => handleFactorBlur(selectedLoadCombinationIndex, loadCaseIndex, 'factor4', e.currentTarget.textContent)}
  contentEditable
  suppressContentEditableWarning>
        <Typography>{loadCase.factor4 !== undefined ? loadCase.factor4 : " "}</Typography>
        </div>
        <div style={{ flex: '1 1 30px', padding: '5px', borderRight: '1px solid #ccc', color: 'black', cursor: 'text' }}  onBlur={(e) => handleFactorBlur(selectedLoadCombinationIndex, loadCaseIndex, 'factor5', e.currentTarget.textContent)}
  contentEditable
  suppressContentEditableWarning>
        <Typography>{loadCase.factor5 !== undefined ? loadCase.factor5 : " "}</Typography>
        </div>
         <div>
      {/* {loadCombinations.map((loadCombination, combinationIndex) => (
        <div key={combinationIndex}>
          <h3>{loadCombination.active}</h3>
          {loadCombination.loadCases.map((loadCase, loadCaseIndex) => (
            <FactorInput
              key={loadCaseIndex}
              combinationIndex={combinationIndex}
              loadCase={loadCase}
              loadCaseIndex={loadCaseIndex}
              handleFactorChange={handleFactorChange}
            />
          ))}
        </div>
      ))} */}
    </div>
      {/* <div style={{ flex: '1 1 30px', padding: '5px', borderRight: '1px solid #ccc', color: 'black' }}><Typography>{loadCase.factor2}</Typography></div>
      <div style={{ flex: '1 1 30px', padding: '5px', borderRight: '1px solid #ccc', color: 'black' }}><Typography>{loadCase.factor3}</Typography></div>
      <div style={{ flex: '1 1 30px', padding: '5px', borderRight: '1px solid #ccc', color: 'black' }}><Typography>{loadCase.factor4}</Typography></div>
      <div style={{ flex: '1 1 30px', padding: '5px', color: 'black' }}><Typography>{loadCase.factor5}</Typography></div> */}
    {/* </div>
  ))}  */}
    {/* {['factor1', 'factor2', 'factor3', 'factor4', 'factor5'].map((factor, factorIndex) => (
            <div
              key={factorIndex}
              style={{ flex: '1 1 30px', padding: '5px', borderRight: '1px solid #ccc', color: 'black', cursor: 'pointer' }}
              onClick={() => handleFactorClick(loadCaseIndex, factor)}
              onBlur={(e) => handleFactorChange(selectedLoadCombinationIndex, loadCaseIndex, factor,e)}
              contentEditable
              suppressContentEditableWarning
            >
              {editingFactor.index === loadCaseIndex && editingFactor.factor === factor ? (
                loadCase[factor]
              ) : (
                <Typography>{loadCase[factor]}</Typography>
              )}
            </div>
          ))} */}
        </div>
      ))}
</Scrollbars>

        </div>
  </Panel>
  </Panel>
      <div style={{  width: '780px', height: '25px', display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', backgroundColor: 'white', padding: '10px'}}>
      {Buttons.SubButton("contained", "Import Load Cases", Import_Load_Cases)}
      {Buttons.SubButton("contained", "Export Load Combination",Export_Load_Combination_Input)}
      {Buttons.SubButton("contained", "Import Load Combination",toggleExcelReader)}
      {Buttons.SubButton("contained", "Generate Load Combination",Generate_Load_Combination)}
      </div>
      <ExcelReader onImport={importLoadCombinationInput} handleFileChange={handleFileChange} />
      <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileChange}
        /> 
      {/* </Panel> */}

		</GuideBox>
	</div>
  );
}

export default App;