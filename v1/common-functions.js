 // Constants
 const nSTACKS = 5;
 const nSECTORS = 18;
 const nLAYERS = 6;
 const nLINEARSTACKS = nSTACKS * nSECTORS;

 // Conventions
 // LinearStackIndex = Sector * nSTACKS + Stack
 // Detector = LinearStackIndex * nLAYERS + Layer

 // Common functions
 function DetectorToStack(detector) { return Math.floor((detector % (nSTACKS * nLAYERS)) / nLAYERS); } // convert detector (=chamber) number 0-539 to local stack index 0-4
 function DetectorToLayer(detector) { return detector % nLAYERS; } // convert detector (=chamber) number 0-539 to local layer 0-5
 function DetectorToLinearStackIndex(detector) { return Math.floor(detector / nLAYERS); } // convert TRD detector/chamber 0-539 index to linear stack index 0-89
 function DetectorToSector(detector) { return Math.floor(detector / nLAYERS / nSTACKS); } // convert linear stack index 0-89 to TRD sector 0-17
 function StackSectorToLinearStackIndex(stack, sector) { return sector * nSTACKS + stack; } // convert sector 0-17 and stack 0-5 to linear stack index 0-89