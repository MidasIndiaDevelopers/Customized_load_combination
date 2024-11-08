import './App.css';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { GuideBox } from '@midasit-dev/moaui';
import * as Buttons from './Components/Buttons';
import { CheckGroup,Check } from '@midasit-dev/moaui';
import Sep from "@midasit-dev/moaui/Components/Separator";
import ExcelReader from './Components/ExcelReader';
import * as XLSX from 'xlsx';
import { useSnackbar, SnackbarProvider } from "notistack";
import { Panel } from '@midasit-dev/moaui';
import { Typography } from '@midasit-dev/moaui';
import ComponentsPanelTypographyDropList from './Components/ComponentsPanelTypographyDropList';
import { Scrollbars } from '@midasit-dev/moaui';
import ComponentsDialogHelpIconButton from './Components/ComponentsDialogHelpIconButton';
import { midasAPI } from "./Function/Common";
import { VerifyUtil, VerifyDialog } from "@midasit-dev/moaui";
import ExcelJS from 'exceljs';  
import { saveAs } from 'file-saver';
import { extractProtocolDomainPort } from '@midasit-dev/moaui/Authentication/VerifyUtil';

function App() {
const [selectedLoadCombinationIndex, setSelectedLoadCombinationIndex] = useState(-1);
const [typeDropdownIndex, setTypeDropdownIndex] = useState(-1); 
const [showDialog, setDialogShowState] = React.useState(false);
const [inputValue, setInputValue] = useState('');
const fileInputRef = useRef(null); 
const [loadCaseDropdownIndex, setLoadCaseDropdownIndex] = useState(-1);
const [signDropdownIndex, setSignDropdownIndex] = useState(null);
const [editingFactor, setEditingFactor] = useState({ index: null, factor: null });
const [selectedDropListValue, setSelectedDropListValue] = useState(1);
const [isAddingLoadCase, setIsAddingLoadCase] = useState(false);
const addLoadCaseTimeout = useRef(null);
const [civilComState, setCivilComState] = useState({ "Assign": {} });
// let [loadNames, setLoadNames] = useState(null);
const [civilCom, setCivilCom] = useState({ "Assign": {} });
const { enqueueSnackbar } = useSnackbar();
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
  const handleDropListChange = (newValue) => {
    setSelectedDropListValue(newValue);
    console.log("Selected Value: ", newValue);
  };
  const handleFactorBlur = (combinationIndex, loadCaseIndex, factorKey, newValue) => {
    console.log('Updating:', {
      combinationIndex,
      loadCaseIndex,
      factorKey,
      newValue,
    });
    // const action = snackbarId => (
    //   <>
    //     <button style={{ backgroundColor: 'transparent', border: 'none',color: 'white', cursor: 'pointer' }} onClick={() => { closeSnackbar(snackbarId) }}>
    //       Dismiss
    //     </button>
    //   </>
    // );
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

    // Initialize loadNames with useState
    let [loadNames, setLoadNames] = useState([
      "Dead Load",
      "Tendon Primary",
      "Creep Primary",
      "Shrinkage Primary",
      "Tendon Secondary",
      "Creep Secondary",
      "Shrinkage Secondary",
    ]);
  
    // Fetch load cases using useEffect
    useEffect(() => {
      (async function importLoadCases() {
        try {
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
  
          const newLoadNames = [...loadNames]; // Create a copy of the existing loadNames
  
          // Process each API response and add to newLoadNames
          if (stct && stct.STCT) {
            for (const key in stct.STCT) {
              const item = stct.STCT[key];
              if (item.vEREC) {
                item.vEREC.forEach((erec) => {
                  if (erec.LTYPECC) {
                    newLoadNames.push(erec.LTYPECC);
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
                  newLoadNames.push(name);
                }
              }
            }
          }
  
          if (smlc && smlc.SMLC) {
            for (const key in smlc.SMLC) {
              const item = smlc.SMLC[key];
              if (item.NAME) {
                newLoadNames.push(item.NAME);
              }
            }
          }
  
          if (mvldid && mvldid.MVLDID) {
            for (const key in mvldid.MVLDID) {
              if (mvldid.MVLDID.hasOwnProperty(key)) {
                const item = mvldid.MVLDID[key];
                if (item && item.LCNAME) {
                  newLoadNames.push(item.LCNAME);
                }
              }
            }
          }
  
          if (mvld && mvld.MVLD) {
            for (const key in mvld.MVLD) {
              if (mvld.MVLD.hasOwnProperty(key)) {
                const item = mvld.MVLD[key];
                if (item && item.LCNAME) {
                  newLoadNames.push(item.LCNAME);
                }
              }
            }
          }
  
          if (mvldch && mvldch.MVLDCH) {
            for (const key in mvldch.MVLDCH) {
              if (mvldch.MVLDCH.hasOwnProperty(key)) {
                const item = mvldch.MVLDCH[key];
                if (item && item.LCNAME) {
                  newLoadNames.push(item.LCNAME);
                }
              }
            }
          }
  
          if (mvldeu && mvldeu.MVLDEU) {
            for (const key in mvldeu.MVLDEU) {
              if (mvldeu.MVLDEU.hasOwnProperty(key)) {
                const item = mvldeu.MVLDEU[key];
                if (item && item.LCNAME) {
                  newLoadNames.push(item.LCNAME);
                }
              }
            }
          }
  
          if (mvldbs && mvldbs.MVLDBS) {
            for (const key in mvldbs.MVLDBS) {
              if (mvldbs.MVLDBS.hasOwnProperty(key)) {
                const item = mvldbs.MVLDBS[key];
                if (item && item.LCNAME) {
                  newLoadNames.push(item.LCNAME);
                }
              }
            }
          }
  
          if (mvldpl && mvldpl.MVLDPL) {
            for (const key in mvldpl.MVLDPL) {
              if (mvldpl.MVLDPL.hasOwnProperty(key)) {
                const item = mvldpl.MVLDPL[key];
                if (item && item.LCNAME) {
                  newLoadNames.push(item.LCNAME);
                }
              }
            }
          }
  
          if (splc && splc.SPLC) {
            for (const key in splc.SPLC) {
              const item = splc.SPLC[key];
              if (item.NAME) {
                newLoadNames.push(item.NAME);
              }
            }
          }
          // Update the loadNames state with the new values
          setLoadNames(newLoadNames);
        } catch (error) {
          console.error('Error fetching load cases:', error);
        }
      })();
    }, []); // Empty dependency array to run once on mount

function importLoadCombinationInput(data) {
  setLoadCombinations(data);
}
  const handleLoadCombinationClick = (index) => {
    console.log("index", index)
    setSelectedLoadCombinationIndex(index);
  };
  console.log(selectedDropListValue);
  // const exportToExcel = () => {
  //   console.log(loadNames);
  //   console.log(civilCom);
  //   console.log(loadCombinations);
  //   loadNames = Array.from(new Set(loadNames));
  //   console.log(loadNames);
  //   // Function to convert column index to Excel column letter (e.g., 3 -> "D")
  //   // const getColumnLetter = (colIndex) => {
  //   //   let letter = '';
  //   //   while (colIndex >= 0) {
  //   //     letter = String.fromCharCode((colIndex % 26) + 65) + letter;
  //   //     colIndex = Math.floor(colIndex / 26) - 1;
  //   //   }
  //   //   return letter;
  //   // };
  
  //   const workbook = new ExcelJS.Workbook();
  
  //   // Add a new worksheet to the workbook
  //   const worksheet = workbook.addWorksheet('Load Combinations');
  
  //   // Add headers to the first row
  //   // worksheet.getCell('A1').value = 'Name';
  //   // worksheet.getCell('B1').value = 'Active';
  //   // worksheet.getCell('C1').value = 'Type';
  
  //   // // Gather all unique LCNAMEs
  //   // let lcNames = new Set();
  //   // Object.keys(civilCom.Assign).forEach((key) => {
  //   //   const combination = civilCom.Assign[key];
  //   //   combination.vCOMB.forEach((item) => {
  //   //     lcNames.add(item.LCNAME); // Add unique LCNAMEs to the set
  //   //   });
  //   // });
  
  //   // Convert lcNames Set to Array for easy iteration
  //   // lcNames = Array.from(lcNames);
  
  //   // Add LCNAME headers to the first row starting from column D
  //   // lcNames.forEach((lcname, index) => {
  //   //   const columnLetter = getColumnLetter(3 + index); // Starting from "D" (index 3)
  //   //   worksheet.getCell(`${columnLetter}1`).value = lcname; // Place each LCNAME in row 1 across columns
  //   // });
  
  //   // Add loadNames headers to the first row starting after LCNAME columns
  //   // loadNames.forEach((name, index) => {
  //   //   const columnLetter = getColumnLetter(3 + index); // Adjust column for loadNames
  //   //   worksheet.getCell(`${columnLetter}1`).value = name; // Place each loadName in row 1
  //   // });
  
  //   // // Iterate over Assign object and add the NAME, ACTIVE, and FACTOR values
  //   // let rowIndex = 2; // Start from row 2 (since row 1 is for headers)
  //   // Object.keys(civilCom.Assign).forEach((key) => {
  //   //   const combination = civilCom.Assign[key];
  //   //   const name = combination.NAME;
  //   //   const active = combination.ACTIVE;
  //   //   const type = combination.iTYPE;
  
  //   //   // Set the NAME, ACTIVE, and TYPE values in columns A, B, and C
  //   //   worksheet.getCell(`A${rowIndex}`).value = name;
  //   //   worksheet.getCell(`B${rowIndex}`).value = active;
  //   //   worksheet.getCell(`C${rowIndex}`).value = type;
  
  //   //   // Iterate through vCOMB to set the FACTOR values for each LCNAME
  //   //   combination.vCOMB.forEach((item) => {
  //   //     const lcname = item.LCNAME;
  //   //     const factor = item.FACTOR;
  
  //   //     // Check if the LCNAME is in the loadNames array
  //   //     const loadNameIndex = loadNames.indexOf(lcname);
  //   //     if (loadNameIndex !== -1) {
  //   //       // Find the correct column for this loadName in the worksheet
  //   //       const columnIndex = 3 + loadNameIndex; // Adjust column based on lcNames and loadNames
  //   //       const columnLetter = getColumnLetter(columnIndex);
          
  //   //       // Set the factor in the correct cell for the current row
  //   //       worksheet.getCell(`${columnLetter}${rowIndex}`).value = factor;
  //   //     }
  //   //   });
  
  //   //   // Increment rowIndex for the next row
  //   //   rowIndex++;
  //   // });
  
  //   // Write the workbook to a buffer and save it as an Excel file
  //   workbook.xlsx.writeBuffer()
  //     .then((buffer) => {
  //       const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  //       saveAs(blob, 'Load_Combination_Input.xlsx'); // Save the file to the user's system
  //     })
  //     .catch((err) => {
  //       console.error('Error creating Excel file:', err);
  //     });
  // };
  const exportToExcel = () => {
    console.log(loadNames);
    console.log(civilCom);
    console.log(loadCombinations);
    loadNames = Array.from(new Set(loadNames));
    console.log(loadNames);

    const workbook = new ExcelJS.Workbook();

    // Add a new worksheet to the workbook
    const worksheet = workbook.addWorksheet('Load Combinations');

    // Add headers to the first row
    worksheet.getCell('A1').value = 'Load Combination';
    worksheet.getCell('B1').value = 'Active';
    worksheet.getCell('C1').value = 'Type';
    worksheet.getCell('D1').value = 'Load Cases';
    worksheet.getCell('E1').value = 'Sign';
    worksheet.getCell('F1').value = 'Factor 1';
    worksheet.getCell('G1').value = 'Factor 2';
    worksheet.getCell('H1').value = 'Factor 3';
    worksheet.getCell('I1').value = 'Factor 4';
    worksheet.getCell('J1').value = 'Factor 5';

    let rowIndex = 2; // Start from row 2 (since row 1 is for headers)

    loadCombinations.forEach((combination) => {
        const loadCombination = combination.loadCombination;
        const active = combination.active;
        const type = combination.type;

        // Add the Load Combination, Active, Type values to columns A, B, and C
        worksheet.getCell(`A${rowIndex}`).value = loadCombination;
        worksheet.getCell(`B${rowIndex}`).value = active;
        worksheet.getCell(`C${rowIndex}`).value = type;

        // Iterate over each loadCase and add the respective data (Load Cases, Sign, Factors)
        combination.loadCases.forEach((loadCase, index) => {
            const loadCaseName = loadCase.loadCaseName;
            const sign = loadCase.sign;
            const factor1 = loadCase.factor1;
            const factor2 = loadCase.factor2;
            const factor3 = loadCase.factor3 || ''; // Handle undefined factors
            const factor4 = loadCase.factor4 || '';
            const factor5 = loadCase.factor5 || '';

            // If it's not the first load case, move to the next row
            if (index !== 0) {
                rowIndex++;
            }

            // Set the Load Cases, Sign, and Factor values in the corresponding columns
            worksheet.getCell(`D${rowIndex}`).value = loadCaseName;
            worksheet.getCell(`E${rowIndex}`).value = sign;
            worksheet.getCell(`F${rowIndex}`).value = factor1;
            worksheet.getCell(`G${rowIndex}`).value = factor2;
            worksheet.getCell(`H${rowIndex}`).value = factor3;
            worksheet.getCell(`I${rowIndex}`).value = factor4;
            worksheet.getCell(`J${rowIndex}`).value = factor5;

            rowIndex++; // Move to the next row after processing each load case
        });
    });

    // Write the workbook to a buffer and save it as an Excel file
    workbook.xlsx.writeBuffer()
        .then((buffer) => {
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            saveAs(blob, 'Load_Combination_Input.xlsx'); // Save the file to the user's system
        })
        .catch((err) => {
            console.error('Error creating Excel file:', err);
        });
};
 
function getLoadCaseFactors(loadCaseName, combinations) {
  const cleanedLoadCaseName = loadCaseName.replace(/\s*\(CB\)$/, '');
  for (const combo of combinations) {
    if (cleanedLoadCaseName === combo.loadCombination) {
      return combo;
    }
  }
  return null;
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
      }else if (newLoadCases.type === "Envelope") {
        result["Envelope"] = result["Envelope"] || [];
        let envelopeResult = [];
        for (let factorIndex = 1; factorIndex <= 5; factorIndex++) {
          let tempArray_envelope = [];
          newLoadCases.loadCases.forEach(envelopeLoadCase => {
            const currentFactorValue = envelopeLoadCase[`factor${factorIndex}`];
            if (currentFactorValue === undefined) return;
            const newSign = multiplySigns(sign, envelopeLoadCase.sign || '+');
            if (loadNames.includes(envelopeLoadCase.loadCaseName)) {
              if (factorIndex === 1) {
                factorArray = createNDimensionalArray(dimension);
                for (let i = 1; i <= 5; i++) {
                  const factorKey = `factor${i}`;
                  let multipliedFactor = envelopeLoadCase[factorKey] * value;
                  multipliedFactor = envelopeLoadCase[factorKey] !== undefined ? envelopeLoadCase[factorKey] * value : 0;

                  if (dimension === 1) {
                    setFactorArrayValue(factorArray, multipliedFactor, 1, dimension, [i - 1]);
                  } else if (dimension === 2) {
                    setFactorArrayValue(factorArray, multipliedFactor, 1, dimension, [i - 1, factor - 1]);
                  } else if (dimension > 2) {
                    let previousFactorArray = [...factorIndexArray];
                    previousFactorArray.pop();
                    let previousFactor = previousFactorArray.length > 0 ? previousFactorArray : [i - 1];
                    const indices = [i - 1, factor - 1].concat(
                      new Array(dimension - 2).fill(previousFactor[previousFactor.length - 1] - 1)
                    );
                    setFactorArrayValue(factorArray, multipliedFactor, 1, dimension, indices);
                  }
                }
                const loadCaseObj = {
                  loadCaseName: envelopeLoadCase.loadCaseName,
                  sign: newSign,
                  factor: factorArray
                };
                tempArray_envelope.push(loadCaseObj);
              }
            } else {
              createCombinations(
                envelopeLoadCase,
                strengthCombination,
                combinations,
                loadNames,
                tempArray_envelope,
                currentFactorValue * value,
                factorIndex,
                newSign,
                dimension + 1,
                [...factorIndexArray, factorIndex]
              );
            }
          });
          envelopeResult.push(tempArray_envelope);
        }
        result["Envelope"].push(envelopeResult);
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
  let envelopeObj = []; // New envelopeObj array to hold "Envelope" objects

  function processObject(obj, parentKey = null) {
    if (Array.isArray(obj)) {
      obj.forEach((value) => {
        if (typeof value === 'object' && value !== null) {
          processKeyValuePairs(value, parentKey);
        }
      });
    } else {
      processKeyValuePairs(obj, parentKey);
    }
  }

  function processKeyValuePairs(obj, parentKey) {
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'Add' || key === 'Either' || key === 'Envelope') {
        parentKey = key;
      }
      if (Array.isArray(value)) {
        let temp = [];
        value.forEach((subArrayOrItem) => {
          if (Array.isArray(subArrayOrItem)) {
            subArrayOrItem.forEach((item) => {
              if (typeof item === 'object' && item !== null && Object.keys(item).length > 0) {
                if (item.Add || item.Either || item.Envelope) {
                  processKeyValuePairs(item, parentKey);
                } else {
                  temp.push(item);
                }
              }
            });
          } else if (typeof subArrayOrItem === 'object' && subArrayOrItem !== null) {
            const newObj = {};
            for (const [itemKey, itemValue] of Object.entries(subArrayOrItem)) {
              newObj[itemKey] = itemValue;
              if (itemKey === 'Add' || itemKey === 'Either' || itemKey === 'Envelope') {
                processKeyValuePairs(subArrayOrItem, parentKey);
              }
            }
            temp.push(newObj);
          } else {
            processObject(subArrayOrItem, parentKey);
          }
        });
        if (parentKey === 'Either') {
          eitherArray.push(temp);
        } else if (parentKey === 'Add') {
          addObj.push(temp);
        } else if (parentKey === 'Envelope') {
          envelopeObj.push(temp);
        }
      } else if (typeof value === 'object' && value !== null) {
        processObject(value, key);
      }
    }
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
      let tempArray = [];
      let loadCaseNames = [];
      let additionalArray = [];
      subArray.forEach((item, itemIndex) => {
        if (item === null) return;
        tempArray = [];
        let temp = [];
        if (typeof item === 'object' && item !== null && Object.keys(item).length > 0) {
          Object.keys(item).forEach((key) => {
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
          if (nextItem === null) continue;
          let loadCaseName_temp = [];
          if (typeof nextItem === 'object' && nextItem !== null && Object.keys(nextItem).length > 0) {
            Object.keys(nextItem).forEach((nextKey) => {
              if (nextItem[nextKey] && nextItem[nextKey].loadCaseName) {
                loadCaseName_temp.push(nextItem[nextKey].loadCaseName);
              }
            });
          }
          if (arraysAreEqual(loadCaseNames, loadCaseName_temp)) {
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
        additionalArray.push(tempArray);
        loadCaseNames = [];
      });
      addObj.push(additionalArray.length > 0 ? additionalArray : tempArray);
    });
    return addObj;
  }

  processObject(inputObj);
  eitherArray = multipleFactor(eitherArray);
  addObj = multipleFactor(addObj);
  envelopeObj = multipleFactor(envelopeObj); // Process envelopeObj using multipleFactor

  console.log({ addObj, eitherArray, envelopeObj });
  return { addObj, eitherArray, envelopeObj };
}

function findStrengthCombinations(combinations) {
  return combinations.filter(combo => 
    combo.active === "Strength" || combo.active === "Service"
  );
}
// const civil_com = { "Assign": {} };
async function generateBasicCombinations(loadCombinations) {
  const strengthCombinations = findStrengthCombinations(loadCombinations);
  if (strengthCombinations.length === 0) {
    console.error("No combinations with active set to 'Strength' found.");
    return [];
  }
  const allFinalCombinations = [];
  // Iterate over each strengthCombination
  for (const strengthCombination of strengthCombinations) {
    const comb_name = strengthCombination.loadCombination;
    const type = strengthCombination.type;
    
    const factorArray = [];
    // Iterate over each loadCase within the strengthCombination
    for (let factor = 1; factor <= 5; factor++) {
      let factorCombinations = [];
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
        const factorObject = factors.find(f => f.factor === factor);
        // Check if the factor value is defined
        if (factorObject && factorObject.value !== undefined) {
          const new_11 = createCombinations(loadCase, strengthCombination, loadCombinations, loadNames, [], factorObject.value, factor, sign);
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
      factorArray.push(factorCombinations);
    }
    console.log(factorArray); // Logs the full factorArray for reference
// Initialize an array to hold the joined combinations
const joinedCombinations = [];
// Iterate over each subarray within factorArray
for (const subArray of factorArray) {
  // Send each subarray to the join function
  const joinedResult = join(subArray);
  // Push the result into joinedCombinations
  joinedCombinations.push(joinedResult);
}
console.log(joinedCombinations);

    if (type === 'Add') {
      let joinedComb = [];
      // Recursive helper function to generate combinations from joinArray
      function combineArrays(arrays, index = 0, currentCombination = []) {
        if (index === arrays.length) {
          // If we've combined arrays from all groups, push the result
          joinedComb.push([...currentCombination]);
          return;
        }
        for (const subArray of arrays[index]) {
          // Combine the current subArray with the ongoing combination
          currentCombination.push(...subArray);
          combineArrays(arrays, index + 1, currentCombination);
          // Backtrack to explore other combinations
          currentCombination.length -= subArray.length;
        }
      }
      for (const subArray of joinedCombinations) {
      if  (subArray.length > 0) {
      combineArrays(subArray);
      allFinalCombinations.push(...joinedComb);
      joinedComb = []
      } 
    }
      joinedComb.forEach((combArray, idx) => {
        const combinationName = `${comb_name}_${idx + 1}`; // comb_name_arraynumber
        // Prepare the vCOMB structure for this combination
        const vCOMB = combArray.map((comb) => ({
          "ANAL": "ST", // Replace "RS" with your required analysis type
          "LCNAME": comb.loadCaseName, // Assuming comb has a property `loadCaseName`
          "FACTOR": (comb.sign === "+" ? 1 : -1) * comb.factor // Assuming comb has properties `sign` and `factor`
        }));

        // Update the state (using setCivilCom) instead of directly modifying civil_com
        setCivilCom(prevState => {
          const newAssign = { ...prevState.Assign };
          newAssign[`${idx + 1}`] = {
            "NAME": combinationName,
            "ACTIVE": "ACTIVE",
            "bCB": false,
            "iTYPE": 0,
            "vCOMB": vCOMB
          };
          return { ...prevState, Assign: newAssign };
        });
      });

      // API call
      const civilComJson = JSON.stringify(civilCom, null, 2);
      console.log(civilComJson);  // This ensures that the JSON is correctly formatted with commas
      try {
        const response = await midasAPI("POST", '/db/lcom-steel', civilCom);
        console.log(response);
      
        // Check if the LCOM-STEEL property exists in the response
        if (response && response['LCOM-STEEL']) {
          enqueueSnackbar("Load-Combination Generated Successfully", {
            variant: "success",
            anchorOrigin: {
              vertical: "top",
              horizontal: "center",
            }
          });
        } else {
          // Handle the case where LCOM-STEEL is not present
          // enqueueSnackbar("Failed to generate Load-Combination", {
          //   variant: "error",
          //   anchorOrigin: {
          //     vertical: "top",
          //     horizontal: "center",
          //   }
          // });
        }
      } 
      catch (error) {
        // console.error("Error occurred:", error);
        // enqueueSnackbar("An error occurred while generating Load-Combination", {
        //   variant: "error",
        //   anchorOrigin: {
        //     vertical: "top",
        //     horizontal: "center",
        //   }
        // });
      }
  }
    if (type === "either") {
      const concatenatedArray = joinedCombinations.flat();
      console.log(concatenatedArray);
      concatenatedArray.forEach((combArray, idx) => {
        const combinationName = `${comb_name}_${idx + 1}`; // comb_name_arraynumber
        const vCOMB = combArray.map((comb) => ({
          "ANAL": "ST", // Assuming "RS" is the analysis type, you can replace it if needed
          "LCNAME": comb.loadCaseName, // Assuming comb has a property `loadCaseName`
          "FACTOR": comb.sign * comb.factor // Assuming comb has properties `sign` and `factor`
        }));

        // Update the state (using setCivilCom) for the "either" type as well
        setCivilCom(prevState => {
          const newAssign = { ...prevState.Assign };
          newAssign[`${idx + 1}`] = {
            "NAME": combinationName,
            "KIND": "GEN",
            "ACTIVE": "INACTIVE",
            "iTYPE": 0,
            "DESC": "desc",
            "vCOMB": vCOMB
          };
          return { ...prevState, Assign: newAssign };
        });
      });
      console.log(civilCom);
    }
  }
  console.log(allFinalCombinations);
  return allFinalCombinations;
}
function join_factor(finalCombinations_sign ) {
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
            target[i] = source[i] !== undefined ? source[i] : target[i];
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
    if (Array.isArray(addObj) && addObj.length > 0) {
      addObj.forEach(mainArray => {
        if (Array.isArray(mainArray)) {
          // Check if the main array has only one subarray
          let combinedArray = [];
    
          if (mainArray.length === 1) {
            const currentArray = mainArray[0];
            
            // Check if currentArray also has only one subarray
            if (currentArray.length === 1 && Array.isArray(currentArray[0]) && currentArray[0].every(item => !Array.isArray(item))) {
              // If so, directly send it to combinedArray
              combinedArray.push(currentArray); // Push the single subarray directly
              flattenedAddObj.push([...deepFlatten(combinedArray)]);
              combinedArray = [];
            } else {
              // Continue with normal processing if there are multiple subarrays
              const length = currentArray[0].length; // Assume all subarrays have the same length (8)
    
              // Loop through each index of the subarrays
              for (let i = 0; i < length; i++) {
                let combinedArray = [];
                currentArray.forEach(subArray => {
                  if (Array.isArray(subArray) && subArray[i]) {
                    combinedArray.push(subArray[i]); // Push the item at the same index
                  } else {
                    combinedArray.push(subArray);
                  }
                });
                flattenedAddObj.push([...deepFlatten(combinedArray)]); // Spread to avoid reference issues
                combinedArray = [];
              }
            }
          } else {
            // Continue with normal processing if there are multiple main arrays
            mainArray.forEach(currentArray => {
              const length = currentArray[0].length; // Assume all subarrays have the same length (8)
    
              // Loop through each index of the subarrays
              for (let i = 0; i < length; i++) {
                let combinedArray = [];
                currentArray.forEach(subArray => {
                  if (Array.isArray(subArray) && subArray[i]) {
                    combinedArray.push(subArray[i]); // Push the item at the same index
                  }
                });
                flattenedAddObj.push([...deepFlatten(combinedArray)]); // Spread to avoid reference issues
                combinedArray = [];
              }
            });
          }
        }
      });
    }
    console.log("Individually Flattened eitherArray:", flattenedEitherArray);
    console.log("Individually Flattened addObj:", flattenedAddObj);
    // Combine factors from both arrays into a single object
    const combinedResults = {};
    const combineFactors = (items) => {
      let combinedResult = {};
      items.forEach(item => {
        // Only process objects with loadCaseName and factor properties
        if (item && typeof item === 'object' && item.loadCaseName && item.factor) {
          const key = `${item.loadCaseName}|${item.sign}`;
          if (!combinedResult[key]) {
            // If the entry does not exist, create it
            combinedResult[key] = {
              loadCaseName: item.loadCaseName,
              sign: item.sign,
              factor: []
            };
          }
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
    const commonArray_add = []; // Initialize the common array to store the results

   flattenedAddObj.forEach(item => {
    let result = []; // Initialize a result array for each iteration
  console.log("Processing flattenedAddObj item:", item);
  const combined = combineFactors(Array.isArray(item) ? item : [item]); 
  result.push(combined); // Push the combined result into the result array
  commonArray_add.push(result); // Add the result array to the common array as a sub-array
});
const commonArray_Add = [];
if (Array.isArray(addObj)) {
  addObj.forEach(currentArray => {
    if (Array.isArray(currentArray) && currentArray.length > 0) {
      const result = {}; // Object to hold merged results for this array
      const length = currentArray[0].length; // Get the length of the current outer array

      // Iterate through each index of the first inner array (assuming all sub-arrays have the same length)
      for (let i = 0; i < length; i++) {
        const combinedFactors = []; // Array to hold the factors for the current index
      
        // // If currentArray length is 1, handle it separately
        // if (currentArray.length === 1) {
        //   const items = currentArray[0][0];
      
        //   // Check if the item is an object and contains loadCaseName and factor
        //   items.forEach(item => {
        //     // Check if the item is an object and contains loadCaseName and factor
        //     if (item && typeof item === 'object' && item.loadCaseName && item.factor) {
        //       const key = `${item.loadCaseName}|${item.sign}`;
        
        //       // Initialize the result object if it doesn't exist
        //       if (!result[key]) {
        //         result[key] = {
        //           loadCaseName: item.loadCaseName,
        //           sign: item.sign,
        //           factor: []
        //         };
        //       }
        //       // Ensure the factor array exists for this index
        //       if (!result[key].factor[i]) {
        //         result[key].factor[i] = undefined; // Initialize if undefined
        //       }
        
        //       // Set the factor directly without merging
        //       if (Array.isArray(item.factor[i])) {
        //         result[key].factor[i] = item.factor[i]; // Directly set the factor
        //       }
        //     }
        //   });
        // } else {
          // Loop through each item in the current outer array
          currentArray.forEach(item => {
            // Check if the item is an object and contains loadCaseName and factor
            if (item && typeof item === 'object' && item.loadCaseName && item.factor) {
              const key = `${item.loadCaseName}|${item.sign}`;
      
              // Initialize the result object if it doesn't exist
              if (!result[key]) {
                result[key] = {
                  loadCaseName: item.loadCaseName,
                  sign: item.sign,
                  factor: []
                };
              }
      
              // Ensure the factor array exists for this index
              if (!result[key].factor[i]) {
                result[key].factor[i] = undefined; // Initialize if undefined
              }
      
              // If the item contains factors, merge them
              if (Array.isArray(item.factor[i])) {
                // Merge existing factors with new factors
                mergeFactors(result[key].factor[i], item.factor[i]);
              }
      
              // If item is an array, handle inner items
              if (Array.isArray(item)) {
                item.forEach(innerItem => {
                  if (innerItem && innerItem.loadCaseName && innerItem.factor) {
                    const innerKey = `${innerItem.loadCaseName}|${innerItem.sign}`;
                    if (!result[innerKey]) {
                      result[innerKey] = {
                        loadCaseName: innerItem.loadCaseName,
                        sign: innerItem.sign,
                        factor: []
                      };
                    }
                    if (Array.isArray(innerItem.factor[i])) {
                      mergeFactors(result[innerKey].factor[i], innerItem.factor[i]);
                    }
                  }
                });
              }
            }
          });
        // }
      }
      
      // Push the merged results for the current outer array
      commonArray_Add.push(result);
    }
  });
}

    console.log("Final Common Array of Results: Add", commonArray_add);
    console.log("Final Common Array of Results: Either", commonArray_Either);
    const normalizeFactors = (factorArray) => {
      // If factorArray is not an array, return it as is
      if (!Array.isArray(factorArray)) return factorArray;
    
      // Process each element within factorArray
      return factorArray.map(item => {
        if (typeof item === 'object' && item !== null) {
          // Get the maximum key present in the object
          const maxKey = Math.max(...Object.keys(item).map(Number));
    
          // Iterate over all keys from 0 to maxKey and ensure each one exists
          for (let index = 0; index <= maxKey; index++) {
            if (!(index in item)) {
              item[index] = undefined; // Add missing key with value `undefined`
            }
          }
          return item;
        } else {
          return item === "empty" ? undefined : item;
        }
      });
    };
    
    const processFactorsArray = (commonArray) => {
      commonArray.forEach(itemArray => {
        itemArray.forEach(subArray => {
          Object.keys(subArray).forEach(key => {
            const factor = subArray[key].factor;
            if (Array.isArray(factor)) {
              subArray[key].factor = normalizeFactors(factor);
            }
          });
        });
      });
    };
     processFactorsArray(commonArray_add);
processFactorsArray(commonArray_Either);
console.log(commonArray_Add);
console.log(commonArray_Either);
    return {
      add: commonArray_add,
      either: commonArray_Either
    };
  } else {
    console.error("finalCombinations_sign is not an object or is null:", finalCombinations_sign);
  }
}

function join(factorCombinations) {
  const joinArray = [];
  const extractedFactorsStore = {};
  for (const combination of factorCombinations) {
    const join = [];
    const { add, either } = combination;
    const eitherJoin = [];
    console.log(either);
    console.log(add);
    function getSingleFactor(factor, factorIndex, i) {
      if (factor.length > factorIndex) {
        let value = factor[factorIndex];
        if (!Array.isArray(value) && i === 0) {
          return value;
        }
        if (value.length > 1) {
          const flattenedArray = value.flat();
          value = flattenedArray[i];
          return value;
        }
      }
      return undefined;
    }
    function extractFactorsFromObject(factorObj, factorIndex, i) {
      const extractedFactors = [];
      for (const key in factorObj) {
        if (factorObj.hasOwnProperty(key)) {
          const { loadCaseName, sign, factor } = factorObj[key];
          const factorValue = getSingleFactor(factor, factorIndex, i); 
          if (factorValue !== undefined && factorValue !== 0 && factorValue !== null) {
            extractedFactors.push({ loadCaseName, sign, factor: factorValue });
          }
        }
      }
      if (!extractedFactorsStore[factorIndex]) {
        extractedFactorsStore[factorIndex] = [];
      }
      extractedFactorsStore[factorIndex][i] = extractedFactors;
      return extractedFactors;
    }
    function combineMatchingFactors(either, factorIndex, i) {
      const combinedResult = [];
      const extractedFactors = either.map(arr => {
        return arr.flatMap(factorObj => {
          return extractFactorsFromObject(factorObj, factorIndex, i);
        });
      });
      if (!extractedFactorsStore[factorIndex]) {
        extractedFactorsStore[factorIndex] = [];
      }
      extractedFactorsStore[factorIndex][i] = extractedFactors;
      function generateCombinations(arrays, temp = [], index = 0) {
        const filteredArrays = arrays.filter(array => Array.isArray(array) && array.length > 0);
        if (index === filteredArrays.length) {
          combinedResult.push([...temp]);
          return;
        }
        for (const item of arrays[index]) {
          temp.push(item);
          generateCombinations(arrays, temp, index + 1);
          temp.pop();
        }
      }
      generateCombinations(extractedFactors);
      return combinedResult;
    }
    function getMaxIValue(either) {
      let maxIValue = 5;  
    
      either.forEach(arr => {
        arr.forEach(item => {
          Object.keys(item).forEach(key => {
            const subItem = item[key];
            if (subItem && subItem.factor && Array.isArray(subItem.factor)) {
              const factorDepth = getArrayDepth(subItem.factor);
              maxIValue = Math.max(maxIValue, Math.pow(5, factorDepth - 1));
            }
          });
        });
      });
    
      return maxIValue;
    }
    
    // Helper function to determine array depth
    function getArrayDepth(array) {
      let depth = 1;
      let current = array;
      while (Array.isArray(current[0])) {
        depth += 1;
        current = current[0];
      }
      return depth;
    }
 
    const maxI = getMaxIValue(either, add);
    console.log('Max i value based on dimensionality:', maxI);
    
    function combineLoadCases(either, add) {
      const allCombinations = [];
      const addmulti = [];
      // Step 1: Loop through each factor and i
      const factorLimit = either.length;
      const maxI = getMaxIValue(either, add);
      console.log(maxI);
      for (let factorIndex = 0; factorIndex < 5; factorIndex++) {
        for (let i = 0; i < maxI; i++) {
          const factorCombinations = combineMatchingFactors(either, factorIndex, i);
          console.log(factorCombinations);
          // Step 2: Iterate through the 'add' arrays
          add.forEach(addArray => {
            if (Array.isArray(addArray) && addArray.length > 0) {
              factorCombinations.forEach(factorCombination => {
                const combinedResult = [...factorCombination];
                const addresult = [];
                addArray.forEach(item => {
                  Object.keys(item).forEach(key => {
                    const value = item[key];
                    const loadCaseName = value.loadCaseName;
                    const sign = value.sign;
                    const factor = value.factor;
                    const factorValue = getSingleFactor(factor, factorIndex, i);
                    
                    if (factorValue !== undefined && factorValue !== 0 && factorValue !== null) {
                      combinedResult.push({ loadCaseName, sign, factor: factorValue });
                    }
                  });
                });
                if (combinedResult.length > 0) {
                  allCombinations.push(combinedResult);
                }
              });
            }
          });
          const nonEmptyFactorCombinations = factorCombinations.filter(factor => factor.length > 0);
          if (add.length === 0 && nonEmptyFactorCombinations.length > 0) {
            allCombinations.push(...factorCombinations);
          }
        }
      }
      console.log('Extracted Factors:', extractedFactorsStore);
      console.log('All Combinations:', allCombinations);
      // let mergearray = [];
      // Convert object to an array of values for easier indexing
      const extractedValues = Object.values(extractedFactorsStore);
// console.log(mergeArray);
const mergeArray = [];
// Helper function to generate permutations
function getCustomCombinations(arrays) {
  const result = [];

  function buildCombination(currentCombination, currentIndex) {
    // Base case: if we've built a combination using elements from all non-empty arrays, add it to the result
    if (currentIndex === arrays.length) {
      result.push([...currentCombination]);
      return;
    }

    // If the current array is empty, skip to the next one
    if (arrays[currentIndex].length === 0) {
      buildCombination(currentCombination, currentIndex + 1);
      return;
    }
    if (currentIndex === 0) {
      // Iterate over the first array
      arrays[currentIndex].forEach((subArray, index) => {
        if (arrays[currentIndex + 1].length > 0) {
          // Pair the subArray from the current index with the opposite element in the next array
          const nextSubArray = arrays[currentIndex + 1][arrays[currentIndex + 1].length - 1 - index];
          currentCombination.push(subArray, nextSubArray); // Add both subarrays to the combination
          buildCombination(currentCombination, currentIndex + 2); // Skip to the next index
          currentCombination.pop(); // Backtrack to try the next combination
          currentCombination.pop(); // Backtrack for the paired subarray
        }
      });
    }
  }
  // Start the recursive process with an empty combination and from the first index
  buildCombination([], 0);

  return result;
}

// Outer loop iterating over j
for (let j = 0; j < 5; j++) {
  let iterationArray = [];

  // Nested loop over i, treating it as the primary fixed element array
  for (let i = 0; i < 5; i++) {
    const baseInnerArray = extractedValues[i][j]; // Array for the fixed element
    const fixedElement = baseInnerArray[0]; // First element of i-th array for fixed position
    // Initialize elementsToPermute with rest of elements in the current i-th array
    let elementsToPermute = [baseInnerArray.slice(1)];
    // Additional loop for other `i` values (0 to 4), except the current `i`
    for (let k = 0; k < 5; k++) {
      if (k === i) continue; // Skip the current i index to avoid repetition
      const additionalArray = extractedValues[k][j];
      if (additionalArray && additionalArray.length > 1) {
        const nonEmptyElements = additionalArray.slice(1).filter(subArr => subArr.length > 0);
        elementsToPermute.push(nonEmptyElements);
      }
    }
    // Generate permutations for elementsToPermute and merge with fixedElement
    console.log(elementsToPermute);
    const permutations = getCustomCombinations(elementsToPermute);
    console.log(permutations);
    permutations.forEach(perm => {
      const mergedInnerArray = [fixedElement, ...perm];
      if (mergedInnerArray.every(el => el && el.length > 0)) {
        iterationArray.push(mergedInnerArray);
      }
    });
  }
  // Append iterationArray to mergeArray if it contains results
  if (iterationArray.length > 0) {
    mergeArray.push([...iterationArray]);
  }
}

console.log(mergeArray);
      function generateCombinations(arrays, tempResult = [], index = 0, finalCombinations = []) {
        // Base case: If we've processed all arrays, push the combination to finalCombinations
        if (index === arrays.length) {
          finalCombinations.push([...tempResult]);
          return;
        }
        // Debugging statement to check what arrays[index] contains
        console.log("Current index:", index, "arrays[index]:", arrays[index]);
        // Check if arrays[index] is an array and is iterable
        if (Array.isArray(arrays[index])) {
          // Loop through each item in the current array at 'index'
          for (const item of arrays[index]) {
            tempResult.push(item);  // Add the item to the current combination
            generateCombinations(arrays, tempResult, index + 1, finalCombinations);  // Recursively process the next array
            tempResult.pop();  // Backtrack: remove the last item before the next iteration
          }
        } else {
          console.error(`Expected an array at index ${index} but found:`, arrays[index]);
        }
      
        return finalCombinations;  // Return all combinations generated
      }
      let combinedResult  = [];
      for (const outerArray of mergeArray) {
        let finalCombinations = [];
        let combinations = [];
        for (let subArray of outerArray) {
            combinations = generateCombinations(subArray);
            finalCombinations.push(combinations);
        }
        combinedResult.push(finalCombinations);
      }
      console.log(combinedResult);
      let addresult = {};  // Use an object to store results by factorIndex and i

for (let factorIndex = 0; factorIndex < 5; factorIndex++) {
  for (let i = 0; i < 5; i++) {
    // Initialize a place to store results for this factorIndex and i
    if (!addresult[factorIndex]) {
      addresult[factorIndex] = {};
    }
    // This will store the addmultiResult for the current factorIndex and i
    addresult[factorIndex][i] = [];
    
    // Iterate over add array
    add.forEach(addArray => {
      if (Array.isArray(addArray) && addArray.length > 0) {
        let addmultiResult = [];  // To store the combination for this addArray, factorIndex, and i
        
        // Loop over each item in the addArray
        addArray.forEach(item => {
          Object.keys(item).forEach(key => {
            const value = item[key];
            const loadCaseName = value.loadCaseName;
            const sign = value.sign;
            const factor = value.factor;
            
            // Get the factor value using the function
            const factorValue = getSingleFactor(factor, factorIndex, i);
            
            // Check if the factorValue is valid
            if (factorValue !== undefined && factorValue !== 0 && factorValue !== null) {
              addmultiResult.push({ loadCaseName, sign, factor: factorValue });
            }
          });
        });
        
        // Only push the result if there are items in addmultiResult
        if (addmultiResult.length > 0) {
          addresult[factorIndex][i].push(addmultiResult);  // Store result for the current factorIndex and i
        }
      }
    });
  }
}
console.log(addresult);
let allCombinations_multi = []; // To store the final results

// Loop through each main array in combinedResult
combinedResult.forEach((mainArray) => {
  // Loop through each inner array in mainArray
  mainArray.forEach((innerArray) => {
    let combinedSet = []; // Array to store all combined arrays for this innerArray

    // Loop through each key in the addResult object
    Object.keys(addresult).forEach((key) => {
      const addArray = addresult[key]; // Access the array or subarray using the key

      // if (innerArray && Array.isArray(innerArray) && addArray && Array.isArray(addArray)) {
        // Iterate through the subarrays at the same index
        innerArray.forEach((subArray, index) => {
          const correspondingAddSubArray = addArray[key]; // Get the matching subarray from addArray

          // Only combine if both subarrays exist
          if (subArray && correspondingAddSubArray) {
            // Iterate through each subarray inside correspondingAddSubArray
            correspondingAddSubArray.forEach((addSubArray) => {
              // Merge the subArray from innerArray with each subarray from correspondingAddSubArray
              const combinedArray = [
                ...subArray, // Spread elements from the main subArray
                ...addSubArray // Spread elements from the current addSubArray
              ];
              combinedSet.push(combinedArray); // Add the combined result to combinedSet
            });
          }
        });
      // }
    });
    // Push the combined set for this innerArray into the main results array
    allCombinations_multi.push(combinedSet);
  });
});
console.log(allCombinations_multi);
const flattenedCombinations = allCombinations_multi.flat(1);

const joinedCombinations = [...flattenedCombinations, ...allCombinations];

// Log the joined array
console.log(joinedCombinations);

  return joinedCombinations;
}
    if (either && either.length > 0) {
      const combined = combineLoadCases(either, add);
      eitherJoin.push(...combined);
      joinArray.push(eitherJoin);
    }

    const addJoin = [];
    if (either.length === 0 && add.length > 0) {
      const combined = [];
      
      for (let factorIndex = 0; factorIndex < 5; factorIndex++) {
        for (let i = 0; i < 5; i++) {
          let allCombinations = [];
          let shouldBreak = false; // Flag to determine whether to break the outer loop
    
          add.forEach(addArray => {
            // Variable to hold combinations for each addArray separately
            let subArrayCombination = [];
    
            if (Array.isArray(addArray) && addArray.length > 0) {
              addArray.forEach(item => {
                Object.keys(item).forEach(key => {
                  const value = item[key];
                  const loadCaseName = value.loadCaseName;
                  const sign = value.sign;
                  const factor = value.factor[factorIndex];
                  let factorValue;
    
                  if (Array.isArray(factor)) {
                    factorValue = getSingleFactor(factor, factorIndex, i);
                  } else {
                    factorValue = factor;
                  }
    
                  // Check if factorValue is valid and non-zero, then push it into subArrayCombination
                  if (factorValue !== undefined && factorValue !== 0) {
                    const combinedResult = { loadCaseName, sign, factor: factorValue };
                    subArrayCombination.push(combinedResult);
    
                    if (!Array.isArray(factor)) {
                      // Set the flag to true for non-array factors and exit inner loops
                      shouldBreak = true;
                      return; // Exit the innermost loop
                    }
                  }
                });
              });
            }
    
            // After processing the entire addArray, add subArrayCombination to allCombinations
            if (subArrayCombination.length > 0) {
              allCombinations.push(subArrayCombination);
            }
    
            if (shouldBreak) {
              return; // Break out of the forEach loop as well
            }
          });
    
          // Push allCombinations to combined if it has entries
          if (allCombinations.length > 0) {
            combined.push(allCombinations);
          }
    
          if (shouldBreak) {
            break; // Break out of the 'i' loop
          }
        }
      }
      addJoin.push(...combined);
      const flattenedAddJoin = addJoin.flat(1); // Flatten by one level
      
      // Push the flattened array to joinArray
      joinArray.push(flattenedAddJoin);
    }
  }
  console.log("Extracted Factors Store: ", extractedFactorsStore);
  return joinArray;
}

function permutation_sign(result11) {
  const { addObj, eitherArray, envelopeObj } = result11;
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
  for (let EnvArrIndex = 0; EnvArrIndex < envelopeObj.length; EnvArrIndex++) {
    let EnvArr = envelopeObj[EnvArrIndex]; 
    for (let innerArrIndex = 0; innerArrIndex < EnvArr.length; innerArrIndex++) {
      let innerArr = EnvArr[innerArrIndex];      
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
  console.log({ addObj, eitherArray, envelopeObj });
  return { addObj, eitherArray,envelopeObj };
}
// function permutation_sign(result11) {
//   const { addObj, eitherArray, envelopeObj } = result11;
//   let finalCombinations = [];

//   function generateCombinations(arrays) {
//     const results = [];
//     function recurse(currentCombo, depth) {
//       if (depth === arrays.length) {
//         results.push([...currentCombo]);
//         return;
//       }
//       for (let i = 0; i < arrays[depth].length; i++) {
//         currentCombo.push(arrays[depth][i]);
//         recurse(currentCombo, depth + 1);
//         currentCombo.pop();
//       }
//     }
//     recurse([], 0);
//     return results;
//   }

//   // Process addObj, eitherArray, and envelopeObj
//   const objectsToProcess = [addObj, eitherArray, envelopeObj];

//   for (const objGroup of objectsToProcess) {
//     if (!objGroup) continue; // Skip undefined objects

//     for (let arrIndex = 0; arrIndex < objGroup.length; arrIndex++) {
//       let array = objGroup[arrIndex];
      
//       for (let innerArrIndex = 0; innerArrIndex < array.length; innerArrIndex++) {
//         let innerArr = array[innerArrIndex];
        
//         for (let objIndex = 0; objIndex < innerArr.length; objIndex++) {
//           let obj = innerArr[objIndex];
//           let positiveArray = [];
//           let negativeArray = [];
//           let dummyArray = [];
//           let dummy = [];
//           let new_temp = [];
//           let temp = [];

//           for (const item of obj) {
//             dummy = [];
//             if (item.sign === "+,-" || item.sign === "-,+") {
//               const positiveObj = { ...item, sign: "+" };
//               const negativeObj = { ...item, sign: "-" };
//               positiveArray.push(positiveObj);
//               negativeArray.push(negativeObj);
//             } else if (item.sign === "±") {
//               const positiveObj = { ...item, sign: "+" };
//               const negativeObj = { ...item, sign: "-" };
//               dummy.push(positiveObj);
//               dummy.push(negativeObj);
//               dummyArray.push(dummy);
//             } else {
//               new_temp.push({ ...item });
//             }
//           }

//           if (dummyArray.length > 0) {
//             const combinations = generateCombinations(dummyArray);
//             if (positiveArray.length > 0 && negativeArray.length > 0) {
//               for (const combination of combinations) {
//                 const combinedWithPositive = [...positiveArray, ...combination];
//                 const combinedWithNegative = [...negativeArray, ...combination];

//                 if (new_temp.length > 0) {
//                   for (const newItem of new_temp) {
//                     const newItemArray = Array.isArray(newItem) ? newItem : [newItem];
//                     temp.push([...combinedWithPositive, ...newItemArray]);
//                     temp.push([...combinedWithNegative, ...newItemArray]);
//                   }
//                 } else {
//                   temp.push(combinedWithPositive);
//                   temp.push(combinedWithNegative);
//                 }
//               }
//             } else {
//               for (const combination of combinations) {
//                 if (new_temp.length > 0) {
//                   for (const newItem of new_temp) {
//                     temp.push([...combination, ...newItem]);
//                   }
//                 } else {
//                   temp.push(combination);
//                 }
//               }
//             }
//           } else {
//             if (new_temp.length > 0) {
//               for (const newItem of new_temp) {
//                 if (positiveArray.length > 0 && negativeArray.length > 0) {
//                   temp.push([...positiveArray, ...newItem]);
//                   temp.push([...negativeArray, ...newItem]);
//                 } else {
//                   temp.push(newItem);
//                 }
//               }
//             } else {
//               if (positiveArray.length > 0) {
//                 temp.push([...positiveArray]);
//               }
//               if (negativeArray.length > 0) {
//                 temp.push([...negativeArray]);
//               }
//             }
//           }

//           if (temp.length === 0) {
//             innerArr.splice(objIndex, 1); // Remove the empty obj from innerArr
//             objIndex--; // Adjust the index after removal to avoid skipping elements
//           } else {
//             obj.length = 0;
//             obj.push(...temp); // Push modified combinations to obj
//           }
//         }
//       }
//     }
//   }

//   console.log({ addObj, eitherArray, envelopeObj });
//   return { addObj, eitherArray, envelopeObj };
// }

function Generate_Load_Combination() {
  const uniqueFactorData = removeDuplicateFactors(loadCombinations);
  setLoadCombinations(uniqueFactorData);
  console.log(uniqueFactorData);
  console.log(loadCombinations);
  const basicCombinations = generateBasicCombinations(loadCombinations);
  console.log(basicCombinations);
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
const removeDuplicateFactors = (data) => {
  return data.map((combination) => {
    // Only process loadCases if type is "Either"
    if (combination.type === "Either") {
      const updatedLoadCases = combination.loadCases.map((loadCase) => {
        const factors = [
          loadCase.factor1,
          loadCase.factor2,
          loadCase.factor3,
          loadCase.factor4,
          loadCase.factor5,
        ];

        // Remove duplicates by creating a Set, then convert back to an array
        const uniqueFactors = Array.from(new Set(factors));

        // Map unique factors back to loadCase properties
        return {
          ...loadCase,
          factor1: uniqueFactors[0] || undefined,
          factor2: uniqueFactors[1] || undefined,
          factor3: uniqueFactors[2] || undefined,
          factor4: uniqueFactors[3] || undefined,
          factor5: uniqueFactors[4] || undefined,
        };
      });

      return {
        ...combination,
        loadCases: updatedLoadCases,
      };
    }
    // Return the combination as-is if type is not "Either"
    return combination;
  });
};

const handleFileChange = (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = (e) => {
    const binaryStr = e.target.result;
    const workbook = XLSX.read(binaryStr, { type: 'binary' });
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];
    const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
    console.log('Raw JSON Data:', jsonData); 
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
          currentLoadCombination = {
            loadCombination,
            active,
            type,
            loadCases: []
          };
          formattedData.push(currentLoadCombination);
        }
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
  const handleAddLoadCase = () => {
    console.log('selectedLoadCombinationIndex',selectedLoadCombinationIndex)
    // addNewLoadCase(selectedLoadCombinationIndex);

    const newLoadCase = {
      loadCaseName: "", 
      sign: "",
      factor1: undefined,
      factor2: undefined,
      factor3: undefined,
      factor4: undefined,
      factor5: undefined
    };
    setLoadCombinations((prevCombinations) => {
      const updatedCombinations = [...prevCombinations];
      updatedCombinations[selectedLoadCombinationIndex].loadCases.push(newLoadCase);
      return updatedCombinations;
    });

    // setIsAddingLoadCase((prevAdding) => {
    //   if (prevAdding) return; 
    //   addNewLoadCase(selectedLoadCombinationIndex);
    //   setTimeout(() => {
    //     setIsAddingLoadCase(false);
    //   }, 500);
  
    //   return true; 
    // });
  };
  
  // const addNewLoadCase = useCallback((combinationIndex) => {
  //   const newLoadCase = {
  //     loadCaseName: "", 
  //     sign: "",
  //     factor1: undefined,
  //     factor2: undefined,
  //     factor3: undefined,
  //     factor4: undefined,
  //     factor5: undefined
  //   };
  //   setLoadCombinations((prevCombinations) => {
  //     const updatedCombinations = [...prevCombinations];
  //     updatedCombinations[combinationIndex].loadCases.push(newLoadCase);
  //     return updatedCombinations;
  //   });
  // }, []);
  
  //Main UI
  return (
	<div className="App" >
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
<ComponentsPanelTypographyDropList 
          selectedValue={selectedDropListValue} 
          onValueChange={handleDropListChange} 
        />
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
      borderTop: '2px solid #ccc',
      boxShadow: '0px -4px 5px -4px grey'
    }}>
           <Scrollbars height={450} width={460}>
  {selectedLoadCombinationIndex >= 0 &&
    loadCombinations[selectedLoadCombinationIndex].loadCases.map((loadCase, loadCaseIndex) => (
      <div key={loadCaseIndex} style={{ display: 'flex', flexDirection: 'row', borderBottom: '1px solid #ccc' }}>
        <div
          style={{ flex: '0 0 132px', padding: '5px', borderRight: '1px solid #ccc', color: 'black', position: 'relative' }}
          onClick={(e) => {
            e.stopPropagation();
            toggleLoadCaseDropdown(loadCaseIndex);
          }}
        >
          <Typography>{loadCase.loadCaseName}</Typography>
          {loadCaseDropdownIndex === loadCaseIndex && (
            <div style={{ position: 'absolute', backgroundColor: 'white', border: '1px solid #ccc', zIndex: 1, top: '100%', left: 0, right: 0 }}>
              {loadNames.map((name, nameIndex) => (
                <div
                  key={nameIndex}
                  onClick={() => handleLoadCaseOptionSelect(selectedLoadCombinationIndex, loadCaseIndex, name)}
                  style={{ padding: '5px', cursor: 'pointer', backgroundColor: name === loadCase.loadCaseName ? '#f0f0f0' : 'white' }}
                >
                  <Typography>{name}</Typography>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic Sign Dropdown */}
        <div
          style={{ flex: '1 1 25px', padding: '5px', borderRight: '1px solid #ccc', color: 'black', position: 'relative' }}
          onClick={(e) => {
            e.stopPropagation();
            toggleSignDropdown(loadCaseIndex);
          }}
        >
          <Typography>{loadCase.sign}</Typography>
          {signDropdownIndex === loadCaseIndex && (
            <div style={{ position: 'absolute', backgroundColor: 'white', border: '1px solid #ccc', zIndex: 1, top: '100%', left: 0, right: 0 }}>
              {['+', '-', '+,-', '±'].map((signOption, signIndex) => (
                <div
                  key={signIndex}
                  onClick={() => handleSignOptionSelect(selectedLoadCombinationIndex, loadCaseIndex, signOption)}
                  style={{ padding: '5px', cursor: 'pointer', backgroundColor: signOption === loadCase.sign ? '#f0f0f0' : 'white' }}
                >
                  <Typography>{signOption}</Typography>
                </div>
              ))}
            </div>
          )}
        </div>
        {['factor1', 'factor2', 'factor3', 'factor4', 'factor5'].map((factorKey, factorIndex) => (
          <div
            key={factorIndex}
            style={{ flex: '1 1 30px', padding: '5px', borderRight: '1px solid #ccc', color: 'black', cursor: 'text', fontSize: '12px' }}
            contentEditable
            suppressContentEditableWarning
            onBlur={(e) => handleFactorBlur(selectedLoadCombinationIndex, loadCaseIndex, factorKey, e.currentTarget.textContent)}
          >
            {loadCase[factorKey] !== undefined ? loadCase[factorKey] : " "}
          </div>
        ))}
      </div>
    ))}
    {/* {selectedLoadCombinationIndex >= 0 && ( */}
    <button
       onClick={handleAddLoadCase}
       disabled={isAddingLoadCase}
      style={{ margin: '10px', padding: '5px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', cursor: 'pointer' }}
    >
      Add Load Case
    </button>
  {/* )} */}
</Scrollbars>
        </div>
  </Panel>
  </Panel>
      <div style={{  width: '780px', height: '25px', display: 'flex', flexDirection: 'row', justifyContent: 'space-evenly', backgroundColor: 'white', padding: '10px'}}>
      {/* {Buttons.SubButton("contained", "Import Load Cases", Import_Load_Cases)} */}
      {Buttons.SubButton("contained", "Export Load Combination",exportToExcel)}
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