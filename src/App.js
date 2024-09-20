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
function createCombinations(loadCases, strengthCombination, combinations, loadNames, result, factors,factor) {
  // Initialize an array to store the factor details for each iteration
  // let factorArray = [];

  // Loop through the factors array and ensure no undefined factors are processed
  // factors.forEach(({ factor, value }) => {
  //   // Nullify the factorArray at the start of each loop
  //   factorArray = [];

  //   if (value === undefined || factor === undefined) {
  //     // Skip this factor if it's undefined
  //     console.warn(`Skipping undefined factor for loadCase: ${loadCases.loadCaseName}`);
  //     return;
  //   }

    // Check if the loadCaseName is present in loadNames
    if (loadNames.includes(loadCases.loadCaseName)) {
      // Create an object with loadCaseName, sign, and corresponding factor
      const loadCaseObj = {
        loadCaseName: loadCases.loadCaseName,
        sign: loadCases.sign,
        factor: factors
      };

      // Add each factor to loadCaseObj
     // Dynamically add the factor as a key and its calculated value
     
     // Multiply the loadCases factor by the factor value
     result.push(loadCaseObj); // Push the object into the factorArray
      // Push to result based on its type (array or object)
      // if (Array.isArray(result)) {
      //   result.push(loadCaseObj); // If result is an array, push the object
      // } else if (typeof result === 'object') {
      //   result[loadCases.loadCaseName] = loadCaseObj; // Add/replace property in the result object
      // } else {
      //   console.error('Result is neither an array nor an object');
      // }
    } else {
      // If loadCaseName is not in loadNames, search for it in combinations array
      const modifyName = getLoadCaseFactors(loadCases.loadCaseName, combinations);
      const newLoadCases = combinations.find(combo => combo.loadCombination === modifyName.loadCombination);

      if (newLoadCases && Array.isArray(newLoadCases.loadCases)) {
        // Handle "Either" and "Add" types similarly as before
        if (newLoadCases.type === "Either") {
          result["Either"] = result["Either"] || [];
          const eitherResult = [];  
          for (let factor = 1; factor <= 5; factor++) {  // Loop through factors from 1 to 5
          const tempArray = []; 
            // Now, perform the forEach operation inside the loop
            newLoadCases.loadCases.forEach(eitherLoadCase => {
              const currentFactorValue = eitherLoadCase[`factor${factor}`]; // Get the current factor value
              if (currentFactorValue === undefined) {
                return;  // Skip the undefined factor
              }
              // Call createCombinations with the current factor and multiply with factors
              createCombinations(eitherLoadCase, strengthCombination, combinations, loadNames, tempArray, currentFactorValue * factors, factor);
              eitherResult.push((tempArray));
              removeDuplicateArrays(eitherResult);
            });      
            result["Either"].push((eitherResult));       
          }
          // result["Either"].push(removeDuplicates(eitherResult));
        } else if (newLoadCases.type === "Add") {
          result["Add"] = result["Add"] || [];
          const addResult = [];
          for (let factor = 1; factor <= 5; factor++) {    // Loop through factors from 1 to 5
            const tempArray = [];  // Create a new empty array at the start of each loop
            
            newLoadCases.loadCases.forEach(addLoadCase => {
              const currentFactorValue = addLoadCase[`factor${factor}`];
              if (currentFactorValue === undefined) {
                return;  // Skip the undefined factor
              }  
              // Call createCombinations with the current factor and multiply with factors
              createCombinations(addLoadCase, strengthCombination, combinations, loadNames, tempArray, currentFactorValue * factors, factor);
              addResult.push((tempArray));
              removeDuplicateArrays(addResult);
            }); 
          }
          result["Add"].push((addResult));
          // result["Add"].push(removeDuplicates(addResult));
        }
      } else {
        console.error(`Load case ${loadCases.loadCaseName} not found in combinations.`);   
      }
    }
    // Push factorArray into the result after processing all factors
  // result.push(factorArray);
  // console.log(result);
  console.log((result));
  
  return result; 
}

function removeDuplicateArrays(arrayOfArrays) {
   // Stringify each array for comparison
  const uniqueArrays = arrayOfArrays.map(arr => JSON.stringify(arr));

  // Remove duplicates by converting to a Set, then back to an array
  const uniqueArraySet = Array.from(new Set(uniqueArrays));

  // Parse the strings back into arrays
  return uniqueArraySet.map(str => JSON.parse(str));
}
function removeDuplicates(arr) {
    const seen = new Set();
    return arr.filter(item => {
      const key = JSON.stringify(item); // Use JSON.stringify to create a unique key
      if (seen.has(key)) {
        return false; // Duplicate found
      }
      seen.add(key);
      return true;
    });
  }

function convertToObj(result, parentKey = '') {
  const finalObj = {}; // This will hold the flattened result

  // Helper function to recursively process key-value pairs and flatten them
  function processKeyValuePair(currentResult, targetObj, parentKey) {
      for (const [key, value] of Object.entries(currentResult)) {
          const newKey = parentKey ? `${parentKey}_${key}` : key; // Combine parentKey with current key for flattening
          
          if (Array.isArray(value) || typeof value === 'object') {
              // If the value is an object or array, process it recursively
              processKeyValuePair(value, targetObj, newKey);
          } else {
              // Store the value in the flattened structure
              targetObj[newKey] = value;
          }
      }
  }
  // Start processing the result recursively
  processKeyValuePair(result, finalObj, parentKey);
  console.log(finalObj);
  return finalObj;
}
function combineAddEither(inputObj) {
  const resultArray = []; // Initialize an empty array
  let eitherArray = []; // Array for "Either" type
  let addObj = [] ; // Object for "Add" type

  // Recursive helper function to process each object
  function processObject(obj, parentKey = null, parentObj = null) {
    let either = [];
    let add = [];
    let newObj;
    // Loop through each key-value pair in the object
    for (const [key, value] of Object.entries(obj)) {
      // First check: if key is neither 'Add' nor 'Either'
      if (key !== 'Add' && key !== 'Either') {
        // Second check: ensure the value itself does not have 'Add' or 'Either' keys
        const valueHasAddOrEither = Object.keys(value).some(k => k === 'Add' || k === 'Either');

        if (!valueHasAddOrEither) {
          // If key is neither "Add" nor "Either", and value also does not contain those keys
          if (parentKey === 'Either') {
            // Create an object for this value and push it into the eitherArray
            newObj = {
              loadCaseName: value[0].loadCaseName,
              sign: value[0].sign,
              factor:  value[0].factor,
            };

            // Dynamically add all factors from 1 to 5
            // for (let factor = 1; factor <= 5; factor++) {
            //   const factorKey = `factor${factor}`;
            //   if (value[0][factorKey] !== undefined) {
            //     newObj[factorKey] = value[0][factorKey]; // Add factor to the new object
            //   }
            // }
            either.push(newObj);
            eitherArray.push(either);
          } else if (parentKey === 'Add') {
            // Create an object for this value and push it into the Add object's array
            newObj = {
              loadCaseName: value[0].loadCaseName,
              sign: value[0].sign,
              factor: value[0].factor
            };

            // Dynamically add all factors from 1 to 5
            // for (let factor = 1; factor <= 5; factor++) {
            //   const factorKey = `factor${factor}`;
            //   if (value[0][factorKey] !== undefined) {
            //     newObj[factorKey] = value[0][factorKey]; // Add factor to the new object
            //   }
            // }
            add.push(newObj); 
            addObj.push(add);
          }
          
        } else {
          // If the value contains 'Add' or 'Either', recursively call processObject
          processObject(value, parentKey, obj); // Call with current parent key and object
        }
      } else {
        // If the key is "Add" or "Either", recursively process the inner object
        processObject(value, key, obj); // Call the function recursively with the current key as the parent
      }
    }
  }
  // Start processing the input object
  function removeDuplicates(arr) {
    const uniqueSet = new Set(arr.map(item => JSON.stringify(item)));
    return Array.from(uniqueSet).map(item => JSON.parse(item));
  }

  // Start processing the input object
  processObject(inputObj);

  // Remove duplicates from eitherArray and addObj
  eitherArray = removeDuplicates(eitherArray);
  addObj = removeDuplicates(addObj);

  return { eitherArray, addObj };
}

function findStrengthCombinations(combinations) {
  return combinations.filter(combo => combo.active === "Strength");
}
// function generateBasicCombinations(loadCombinations) {
//   const strengthCombinations = findStrengthCombinations(loadCombinations);

//   if (strengthCombinations.length === 0) {
//     console.error("No combinations with active set to 'Strength' found.");
//     return [];
//   }
//   const allFinalCombinations = [];
//   for (const strengthCombination of strengthCombinations) {
//     const type = strengthCombination.type;
//     let factorCombinations;
//     for (let factor = 1; factor <= 5; factor++) { // Loop through factors 1 to 5 
//     // Iterate over each loadCase within the strengthCombination
//     factorCombinations = [];
//     for (const loadCase of strengthCombination.loadCases) {
//         const factorKey = `factor${factor}`;
//         const factorArray = [];
//         // Extract the specific factor value
//         const factorValue = loadCase[factorKey] !== undefined ? loadCase[factorKey] : 1;     
//         // Call createCombinations with the extracted factor value
//         createCombinations(loadCase, strengthCombination, loadCombinations, loadNames, factorArray, factorValue,factor);
//         const result11 = combineAddEither(factorArray, factor);
//         const finalCombinations = permutation(result11);
//         factorCombinations.push(finalCombinations);
//         console.log(factorCombinations);
//         allFinalCombinations.push(factorCombinations);
//       }
//     }
//     // allFinalCombinations.push(factorCombinations);
//     console.log(allFinalCombinations);
//     // if (type === 'Add') {
//     //   const combinationArray = [];

//     //   // Helper function to check if the array is flat (does not contain nested arrays)
//     //   const isFlatArray = (arr) => arr.every(item => !Array.isArray(item));

//     //   // Helper function to flatten an array or wrap an object in an array
//     //   const ensureArray = (item) => Array.isArray(item) ? item : [item];

//     //   // Recursive function to create combinations
//     //   const createCombinations = (arrays, index = 0, currentCombination = []) => {
//     //     if (index === arrays.length) {
//     //       combinationArray.push([...currentCombination]); // Push the final combination
//     //       return;
//     //     }
//     //     const currentArray = ensureArray(arrays[index]);
//     //     if (isFlatArray(currentArray)) {
//     //       // If the current array is flat, pass the entire array as one element in the combination
//     //       createCombinations(arrays, index + 1, [...currentCombination, ...currentArray]);
//     //     } else {
//     //       // If the current array contains nested arrays, continue combining individual elements
//     //       for (const item of currentArray) {
//     //         createCombinations(arrays, index + 1, [...currentCombination, item]);
//     //       }
//     //     }
//     //   };

//     //   // Start the combination process with allFinalCombinations
//     //   createCombinations(allFinalCombinations);

//     //   allFinalCombinations.push(combinationArray);  // Store the final combinations
//     // }
//   }
//   return allFinalCombinations;
// }
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
      // Loop through factors from 1 to 5 
        
       
        // Collect the factor value for the current factor
        const factorKey = `factor${factor}`;
        if (factorKey in loadCase) {
          // Extract the specific factor value
          const factorValue = loadCase[factorKey];
          factors.push({ factor, value: factorValue });  // Push factor number and its value as an object
        } else {
          // If the factor is not present, add it with a default value of 1
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
    console.log(factors);
        // Call createCombinations with the current factor
        for (let factor = 1; factor <= 5; factor++) {
          const factorObject = factors.find(f => f.factor === factor);
          
          // Check if the factor value is defined
          if (factorObject && factorObject.value !== undefined) {
            const new_11 = createCombinations(loadCase, strengthCombination, loadCombinations, loadNames, [], factorObject.value, factor);
            console.log(new_11);
  
            // Combine and permute the results
            const result11 = combineAddEither([new_11]);
            console.log(result11);
            const finalCombinations = permutation(result11);
  
            // Add the permutations to the factorCombinations array
            factorCombinations.push(finalCombinations);
          }
        }
    }
    // Push the combinations for this strengthCombination to allFinalCombinations
    allFinalCombinations.push(factorCombinations);
    console.log(factorCombinations);
  }
  
  return allFinalCombinations;
}
function permutation(result11) {
  const { addObj, eitherArray } = result11; // Destructure addObj from result11
  const add = []; // Array to collect all objects from addObj
  let dummyArray = []; // Temporary array to hold objects with ± sign for permutation generation
  let either = [];
  let finalCombinations = []; 
  // Helper function to generate permutations of + and - signs
  function generatePermutations(objects) {
    const permutations = [];
    const numPermutations = 2 ** objects.length; // Total number of permutations

    // Loop through each possible combination of signs
    for (let i = 0; i < numPermutations; i++) {
      const newCombination = [];
      for (let j = 0; j < objects.length; j++) {
        // Use bit manipulation to decide whether to assign + or -
        const sign = (i & (1 << j)) ? "+" : "-";
        const newObj = { ...objects[j], sign };
        newCombination.push(newObj);
      }
      permutations.push(newCombination);
    }

    return permutations;
  }

  // Step 1: Process each array inside addObj
  for (const addArr of addObj) {
    const positiveArray = []; // Array to collect objects with + sign
    const negativeArray = []; // Array to collect objects with - sign

    for (const obj of addArr) {
      if (obj.sign === "+,-") {
        // Handle +,- sign: create + and - versions and push to arrays
        const positiveObj = { ...obj, sign: "+" };
        const negativeObj = { ...obj, sign: "-" };

        positiveArray.push(positiveObj);
        negativeArray.push(negativeObj);
      } else if (obj.sign === "±") {
        // Push the object to dummyArray for later permutations
        dummyArray.push(obj);
      } else {
        // For any other sign (+ or -), push the object to both positive and negative arrays
        add.push({ ...obj });
      }
    }
    // Step 2: Handle permutation for objects with ± sign
    if (positiveArray.length > 0 || negativeArray.length > 0) {
      const combinedPositiveArray = [...add, ...positiveArray]; // Combine positive objects with add array
      const combinedNegativeArray = [...add, ...negativeArray]; // Combine negative objects with add array

      // Push the two new arrays into add array
      add.push(combinedPositiveArray);
      add.push(combinedNegativeArray);
    }
  }

  function combineArrays(arrays, index, currentCombination, result) {
    if (index === arrays.length) {
      // We've reached the last array, push the current combination into the result
      result.push([...currentCombination]);
      return;
    }

    // Loop through each object in the current array and recursively combine
    for (const obj of arrays[index]) {
      currentCombination.push(obj); // Add current object to the combination
      combineArrays(arrays, index + 1, currentCombination, result); // Recurse for the next array
      currentCombination.pop(); // Backtrack to try the next object
    }
  }

  if (eitherArray.length > 0) {
    combineArrays(eitherArray, 0, [], either); // Initialize the recursive combination process
  }

 // Step 4: Combine add and either arrays to create finalCombinations
 if (add.length > 0) {
  if (either.length > 0) {
    // Both add and either arrays are not empty
    for (const addArr of add) {
      for (const eitherArr of either) {
        // Combine one array from add and one from either
        const combinedArray = [...addArr, ...eitherArr];
        finalCombinations.push(combinedArray); // Push the combined array into finalCombinations
      }
    }
  } else {
    // Either array is empty, just push arrays from add
    finalCombinations.push(...add);
  }
} else if (either.length > 0) {
  // Add array is empty, just push arrays from either
  finalCombinations.push(...either);
}
// Return the final combinations array
return finalCombinations;
}

function Generate_Load_Combination() {
  const basicCombinations = generateBasicCombinations(loadCombinations);
  // console.log(basicCombinations);
  // const permutations = generatePermutationsOfCombinations(basicCombinations);
  // console.log("All Possible Permutations of Combinations:", permutations);
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