# Budget & Investment Calculator

A simple, responsive web app for planning a monthly budget and projecting investment growth.

Developed by Bakri.

## Features
- Budget planner with income, bill items, and target savings
- Automatic summary of totals and leftover cash
- Visual allocation bars for income distribution
- Investment projection with contributions, timing, and return rate
- Currency selection for inputs and summaries
- Clean, mobile-friendly layout

## Tech Stack
- HTML5
- CSS3
- Vanilla JavaScript

## Getting Started
1. Clone or download this repository.
2. Open `index.html` in your browser.

Optional: run a local web server for a smoother dev workflow.

### Example (PowerShell)
```powershell
# from the project folder
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

## How It Works
- **Budget:** totals your bills, subtracts them from income, then shows leftover cash and an optional target savings amount.
- **Investment:** runs a simple month-by-month simulation using a constant annual return rate and regular contributions. Timing (begin/end of period) is supported. This is a simplified model for learning and planning.

## File Structure
- `index.html` - app layout and form structure
- `style.css` - visual styling and responsive layout
- `script.js` - calculator logic and UI updates

## Notes
This project is for educational and planning purposes only. It does not provide financial advice.
