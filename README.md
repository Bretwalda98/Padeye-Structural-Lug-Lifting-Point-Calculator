# Padeye – Structural Lug & Lifting Point Calculator

This repository hosts an interactive web-based tool for the design and verification of padeyes (lifting lugs).  
The tool follows standard engineering practice and incorporates code-based checks from:

- **Eurocode 3 (EN 1993)** – steel design rules for tension, shear, and bearing.  
- **AISC Steel Design Manual** – bearing and block shear formulations.  
- **DNV-ST-N001 / DNV-ST-0378** – offshore lifting appliances and padeye guidance.  

## Features
- ✅ **Bearing check** at the pin–plate interface.  
- ✅ **Shear-out check** at hole edge (a–a / c–c sections).  
- ✅ **Net section tension** at ligament behind the hole (b–b section).  
- ✅ **Weld shear check** for cheek plates to main plate.  
- ✅ **Pin verification** (shear and bearing).  
- ✅ **Interactive infographic** showing padeye geometry, load angle, and plate build-up.  
- ✅ **Pass/Fail utilisation ratios** based on input yield strength and load factors.  

## Usage
1. Clone or download this repository.  
2. Open `padeye.html` in your browser.  
3. Enter geometry, material strength, and design load.  
4. Results update in real-time, with schematic diagram and utilisation ratios.  

## Disclaimer
This tool is intended for preliminary sizing and verification checks in line with established design codes.  
Always validate results with full engineering judgement and project-specific standards.
