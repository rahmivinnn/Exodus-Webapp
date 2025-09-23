# FREIGHT RATE CALCULATOR - DEVELOPER DOCUMENTATION

##  OVERVIEW

This document provides comprehensive documentation for the Freight Rate Calculator system. It's designed to help any developer understand, maintain, and extend the codebase without confusion.

##  ARCHITECTURE

### File Structure
`
lib/
 freight-calculator.ts          # Core calculation logic & types
 rate-limit.ts                  # API rate limiting utilities

components/
 FreightRateCalculator.tsx      # Main React component
 ui/                           # Reusable UI components
     alert.tsx
     badge.tsx
     dialog.tsx
     scroll-area.tsx
     separator.tsx
     switch.tsx
     tabs.tsx
`

### Key Principles
- **Single Responsibility**: Each file has one clear purpose
- **DRY (Don't Repeat Yourself)**: No duplicate logic anywhere
- **SOLID Principles**: Clean, maintainable architecture
- **TypeScript First**: Full type safety throughout
- **Comprehensive Documentation**: Every function is documented

##  CORE COMPONENTS

### 1. FreightRateCalculator Component (components/FreightRateCalculator.tsx)

**Purpose**: Main React component for the freight rate calculator interface.

**Key Features**:
- Real-time rate calculations
- Form validation and error handling
- Responsive design with animations
- Clean, maintainable code structure

**Props Interface**:
`	ypescript
interface FreightRateCalculatorProps {
  onRateCalculated?: (result: FreightRateResult) => void;
  onError?: (error: string) => void;
  initialData?: Partial<FreightRateInput>;
}
`

**Usage Example**:
`	sx
import { FreightRateCalculator } from "@/components/FreightRateCalculator";

// Basic usage
<FreightRateCalculator />

// With callbacks
<FreightRateCalculator 
  onRateCalculated={(result) => console.log('Rate:', result)}
  onError={(error) => console.error('Error:', error)}
  initialData={{ origin: "New York, NY" }}
/>
`

### 2. Freight Calculator Utilities (lib/freight-calculator.ts)

**Purpose**: Centralized calculation logic and data types.

**Key Functions**:

#### calculateFreightRate(input: FreightRateInput): FreightRateResult
Main calculation function that computes freight rates based on:
- Distance between cities
- Equipment type characteristics
- Weight-based adjustments
- Fuel surcharges
- Additional surcharges

#### alidateFreightRateInput(input: FreightRateInput): ValidationResult
Validates input data and returns validation results with error messages.

#### calculateDistance(origin: string, destination: string): number
Calculates distance between two cities using Haversine formula.

#### calculateTransitTime(distance: number): number
Estimates delivery time based on distance using industry standards.

#### calculateConfidence(input: FreightRateInput): number
Calculates confidence score based on input completeness and market factors.

**Usage Example**:
`	ypescript
import { 
  calculateFreightRate, 
  validateFreightRateInput,
  type FreightRateInput 
} from "@/lib/freight-calculator";

const input: FreightRateInput = {
  origin: "New York, NY",
  destination: "Los Angeles, CA",
  equipmentType: "van",
  weight: 40000,
  pickupDate: "2024-01-15",
  pickupTime: "08:00"
};

// Validate input
const validation = validateFreightRateInput(input);
if (!validation.isValid) {
  console.error("Validation errors:", validation.errors);
  return;
}

// Calculate rate
const result = calculateFreightRate(input);
console.log("Total cost:", result.totalCost);
console.log("Estimated days:", result.estimatedDays);
`

##  DATA TYPES

### Core Interfaces

#### FreightRateInput
`	ypescript
interface FreightRateInput {
  origin: string;                    // Required: Origin city
  destination: string;               // Required: Destination city
  equipmentType: string;             // Required: Equipment type
  weight?: number;                   // Optional: Weight in pounds
  distance?: number;                 // Optional: Distance in miles
  pickupDate?: string;               // Optional: Pickup date (YYYY-MM-DD)
  pickupTime?: string;               // Optional: Pickup time (HH:MM)
  surcharge?: number;                // Optional: Additional surcharge
  fuelSurcharge?: number;            // Optional: Fuel surcharge
}
`

#### FreightRateResult
`	ypescript
interface FreightRateResult {
  baseRate: number;                  // Base rate before adjustments
  totalCost: number;                 // Total cost including all surcharges
  estimatedDays: number;             // Estimated delivery time in days
  confidence: number;                // Confidence level (0-1)
  breakdown: {                       // Detailed cost breakdown
    baseRate: number;
    weightCost: number;
    distanceCost: number;
    fuelSurcharge: number;
    additionalSurcharges: number;
  };
}
`

#### EquipmentType
`	ypescript
interface EquipmentType {
  value: string;                     // Unique identifier
  label: string;                     // Human-readable name
  baseRatePerMile: number;           // Base rate per mile in USD
  weightMultiplier: number;          // Weight-based pricing multiplier
  fuelSurchargeRate: number;         // Fuel surcharge rate (percentage)
}
`

##  CALCULATION LOGIC

### Rate Calculation Formula

`
Total Cost = Base Rate + Weight Cost + Distance Cost + Fuel Surcharge + Additional Surcharges

Where:
- Base Rate = Distance  Equipment Base Rate Per Mile
- Weight Cost = Weight  Equipment Weight Multiplier
- Distance Cost = Distance > 1000 miles ? Distance  0.1 : 0
- Fuel Surcharge = Base Rate  Equipment Fuel Surcharge Rate
- Additional Surcharges = Custom Surcharges + Fuel Surcharges
`

### Transit Time Calculation

| Distance Range | Transit Time |
|----------------|--------------|
|  100 miles    | 1 day        |
| 101-300 miles  | 2 days       |
| 301-600 miles  | 3 days       |
| 601-1000 miles | 4 days       |
| 1001-1500 miles| 5 days       |
| 1501-2500 miles| 7 days       |
| > 2500 miles   | Distance  400 miles/day |

### Confidence Calculation

Confidence is calculated based on:
- **Input Completeness (40%)**: Required fields filled
- **Business Hours (10%)**: Request made during business hours
- **Booking Window (10%)**: Pickup date 1-7 days in advance
- **Base Confidence (40%)**: Always present

##  DEVELOPMENT GUIDELINES

### Code Style
- Use TypeScript for all new code
- Follow the existing naming conventions
- Add JSDoc comments for all public functions
- Use meaningful variable and function names
- Keep functions small and focused

### Error Handling
- Always validate input data before processing
- Provide clear, user-friendly error messages
- Log errors for debugging purposes
- Handle edge cases gracefully

### Testing
- Test all calculation functions with various inputs
- Test form validation with invalid data
- Test UI components with different states
- Test error handling scenarios

### Performance
- Avoid unnecessary re-renders in React components
- Use memoization for expensive calculations
- Optimize bundle size by importing only what's needed
- Consider lazy loading for large components

##  EXTENDING THE SYSTEM

### Adding New Equipment Types

1. Add the new equipment type to EQUIPMENT_TYPES array in lib/freight-calculator.ts:
`	ypescript
{
  value: "new_equipment",
  label: "New Equipment Type",
  baseRatePerMile: 3.00,
  weightMultiplier: 0.18,
  fuelSurchargeRate: 0.14
}
`

2. The component will automatically pick up the new equipment type.

### Adding New Cities

1. Add city coordinates to the cityCoordinates object in calculateDistance function:
`	ypescript
"New City, ST": { lat: 40.7128, lng: -74.0060 }
`

2. Add the city to the US_CITIES array for the dropdown.

### Adding New Calculation Factors

1. Add new fields to FreightRateInput interface
2. Update the calculateFreightRate function to include the new factor
3. Update the validation function if needed
4. Update the UI component to include the new field

### Example: Adding Weather Factor

`	ypescript
// 1. Update interface
interface FreightRateInput {
  // ... existing fields
  weatherCondition?: 'clear' | 'rain' | 'snow' | 'storm';
}

// 2. Update calculation
function calculateFreightRate(input: FreightRateInput): FreightRateResult {
  // ... existing calculations
  
  // Add weather factor
  const weatherMultiplier = getWeatherMultiplier(input.weatherCondition);
  totalCost *= weatherMultiplier;
  
  // ... rest of function
}

// 3. Add weather multiplier function
function getWeatherMultiplier(weather?: string): number {
  switch (weather) {
    case 'clear': return 1.0;
    case 'rain': return 1.1;
    case 'snow': return 1.2;
    case 'storm': return 1.3;
    default: return 1.0;
  }
}
`

##  TROUBLESHOOTING

### Common Issues

#### 1. Build Errors
- **Issue**: TypeScript compilation errors
- **Solution**: Check that all imports are correct and types are properly defined
- **Prevention**: Use TypeScript strict mode and fix errors immediately

#### 2. Runtime Errors
- **Issue**: Component crashes or calculations fail
- **Solution**: Check console for error messages and validate input data
- **Prevention**: Add proper error handling and validation

#### 3. Performance Issues
- **Issue**: Slow calculations or UI lag
- **Solution**: Profile the code and optimize expensive operations
- **Prevention**: Use React.memo and useMemo for expensive calculations

#### 4. Styling Issues
- **Issue**: UI doesn't look correct
- **Solution**: Check Tailwind CSS classes and responsive design
- **Prevention**: Test on different screen sizes and browsers

### Debugging Tips

1. **Use Browser DevTools**: Check console for errors and network requests
2. **Add Logging**: Use console.log to debug calculation steps
3. **Test with Known Values**: Use test data with expected results
4. **Check TypeScript**: Ensure all types are correct
5. **Validate Inputs**: Make sure all required fields are provided

##  RESOURCES

### Documentation
- [React Documentation](https://reactjs.org/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Framer Motion Documentation](https://www.framer.com/motion)

### Tools
- [VS Code](https://code.visualstudio.com/) - Recommended IDE
- [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools) - Browser extension
- [TypeScript Playground](https://www.typescriptlang.org/play) - Online TypeScript editor

### Testing
- [Jest](https://jestjs.io/) - JavaScript testing framework
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro) - React component testing
- [Cypress](https://www.cypress.io/) - End-to-end testing

##  CONTRIBUTING

### Before Making Changes
1. Read this documentation thoroughly
2. Understand the existing code structure
3. Plan your changes carefully
4. Test your changes thoroughly

### Code Review Checklist
- [ ] Code follows existing style guidelines
- [ ] All functions have proper documentation
- [ ] TypeScript types are correctly defined
- [ ] Error handling is implemented
- [ ] Tests are included for new functionality
- [ ] No duplicate code is introduced
- [ ] Performance is considered

### Pull Request Process
1. Create a feature branch from main
2. Make your changes with clear commit messages
3. Test your changes thoroughly
4. Update documentation if needed
5. Create a pull request with detailed description
6. Address any review feedback
7. Merge after approval

##  SUPPORT

If you have questions or need help:

1. **Check this documentation first**
2. **Search existing issues** in the repository
3. **Create a new issue** with detailed description
4. **Contact the development team** for urgent matters

---

**Last Updated**: January 2024  
**Version**: 1.0.0  
**Maintainer**: Exodus Logistix Development Team
