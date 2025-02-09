const API_KEY = "4c835ab4180bdcd9db2695b2";
const API_URL = `https://v6.exchangerate-api.com/v6/${API_KEY}/latest/`;

document.addEventListener('DOMContentLoaded', function() {
    const fromCurrencySelect = document.getElementById("from");
    const toCurrencySelect = document.getElementById("to");
    const amountInput = document.getElementById("amount");
    const fromFlag = document.getElementById("from-flag");
    const toFlag = document.getElementById("to-flag");
    const form = document.querySelector("form");
    const resultContainer = document.getElementById("result-container");

    if (!resultContainer || !form) return;

    async function populateCurrencyOptions() {
        try {
            const response = await fetch(`${API_URL}USD`);
            const data = await response.json();

            if (data.result === "success") {
                const currencies = Object.keys(data.conversion_rates);
                currencies.forEach((currency) => {
                    const optionFrom = document.createElement("option");
                    optionFrom.value = currency;
                    optionFrom.textContent = currency;
                    fromCurrencySelect.appendChild(optionFrom);

                    const optionTo = document.createElement("option");
                    optionTo.value = currency;
                    optionTo.textContent = currency;
                    toCurrencySelect.appendChild(optionTo);
                });

                fromCurrencySelect.value = "USD";
                toCurrencySelect.value = "INR";
                updateFlags();
            }
        } catch (error) {
            showErrorMessage("Error loading currency options.");
        }
    }

    function updateFlags() {
        const fromCurrencyCode = fromCurrencySelect.value.slice(0, 2);
        const toCurrencyCode = toCurrencySelect.value.slice(0, 2);
        fromFlag.src = `https://flagsapi.com/${fromCurrencyCode}/flat/64.png`;
        toFlag.src = `https://flagsapi.com/${toCurrencyCode}/flat/64.png`;
    }

    async function getExchangeRate(fromCurrency, toCurrency, amount) {
        try {
            showLoadingState();
            const response = await fetch(`${API_URL}${fromCurrency}`);
            const data = await response.json();

            if (data.result === "success") {
                const exchangeRate = data.conversion_rates[toCurrency];

                if (isNaN(amount) || amount <= 0) {
                    showErrorMessage("Please enter a valid amount.");
                    return;
                }

                const convertedAmount = (amount * exchangeRate).toFixed(2);
                displayResult(fromCurrency, toCurrency, exchangeRate, convertedAmount);
            } else {
                showErrorMessage("Unable to fetch exchange rate. Please try again later.");
            }
        } catch (error) {
            showErrorMessage("An error occurred. Please check your internet connection.");
        }
    }

    function showLoadingState() {
        resultContainer.innerHTML = `
            <div class="result-box">
                <p>Loading exchange rates...</p>
            </div>
        `;
    }

    function displayResult(fromCurrency, toCurrency, exchangeRate, convertedAmount) {
        resultContainer.innerHTML = `
            <div class="result-box">
                <h3>Exchange Rate & Conversion Result</h3>
                <p>1 ${fromCurrency} = ${exchangeRate} ${toCurrency}</p>
                <p>Converted Amount: <strong>${convertedAmount} ${toCurrency}</strong></p>
            </div>
        `;
    }

    function showErrorMessage(message) {
        resultContainer.innerHTML = `
            <div class="result-box error">
                <p>${message}</p>
            </div>
        `;
    }

    function swapCurrencies() {
        const fromValue = fromCurrencySelect.value;
        const toValue = toCurrencySelect.value;

        fromCurrencySelect.value = toValue;
        toCurrencySelect.value = fromValue;

        updateFlags();

        const amount = parseFloat(amountInput.value);
        if (amount > 0) {
            getExchangeRate(toValue, fromValue, amount);
        }
    }

    // Event Listeners
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        const amount = amountInput.value;
        const fromCurrency = fromCurrencySelect.value;
        const toCurrency = toCurrencySelect.value;
        await getExchangeRate(fromCurrency, toCurrency, amount);
    });

    fromCurrencySelect.addEventListener("change", updateFlags);
    toCurrencySelect.addEventListener("change", updateFlags);

    const swapButton = document.querySelector('.fa-right-left');
    if (swapButton) {
        swapButton.parentElement.addEventListener('click', function(e) {
            e.preventDefault();
            this.classList.add('rotate-animation');
            setTimeout(() => {
                this.classList.remove('rotate-animation');
            }, 500);
            swapCurrencies();
        });
    }

    // Initialize
    populateCurrencyOptions();
});

function initializeCurrencyConverter() {

    const amountToConvert = localStorage.getItem('amountToConvert');
    if (amountToConvert) {
        document.getElementById('amount').value = amountToConvert;

        localStorage.removeItem('amountToConvert');
    }


    const urlParams = new URLSearchParams(window.location.search);
    const fromCurrency = urlParams.get('from');
    if (fromCurrency) {
        fromCurrencySelect.value = fromCurrency;
        updateFlags();
    }
}

initializeCurrencyConverter();
