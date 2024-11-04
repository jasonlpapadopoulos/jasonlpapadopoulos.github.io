        // Handle collapsible sections
        document.querySelectorAll('.section-header').forEach(header => {
            header.addEventListener('click', () => {
                const content = header.nextElementSibling;
                const isOpen = content.classList.contains('open');
                
                header.classList.toggle('active');
                content.classList.toggle('open');
            });
        });

        // Handle select all functionality
        document.querySelectorAll('.select-all').forEach(selectAll => {
            selectAll.addEventListener('change', (e) => {
                const section = e.target.closest('.section-content');
                const checkboxes = section.querySelectorAll('input[name="neighborhood"]');
                checkboxes.forEach(checkbox => {
                    checkbox.checked = e.target.checked;
                });
                updateSubmitButton();
                updateSelectedNeighborhoods();
            });
        });

        // Handle individual checkbox changes affecting select all
        document.querySelectorAll('.neighborhood-list').forEach(list => {
            list.addEventListener('change', (e) => {
                if (e.target.name === 'neighborhood') {
                    const section = e.target.closest('.section-content');
                    const selectAll = section.querySelector('.select-all');
                    const checkboxes = section.querySelectorAll('input[name="neighborhood"]');
                    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
                    const someChecked = Array.from(checkboxes).some(cb => cb.checked);
                    
                    selectAll.checked = allChecked;
                    selectAll.indeterminate = someChecked && !allChecked;
                    
                    updateSubmitButton();
                    updateSelectedNeighborhoods();
                }
            });
        });

        // Handle submit button state
        function updateSubmitButton() {
            const allCheckboxes = document.querySelectorAll('input[name="neighborhood"]');
            const submitButton = document.querySelector('.submit-button');
            const isAnyChecked = Array.from(allCheckboxes).some(checkbox => checkbox.checked);
            submitButton.disabled = !isAnyChecked;
        }

// Add event listener to button for navigation
document.querySelector('.submit-button').addEventListener('click', function() {
    if (!this.disabled) {
        const selectedNeighborhoods = Array.from(document.querySelectorAll('input[name="neighborhood"]'))
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.value);
        
        localStorage.setItem('selectedNeighborhoods', JSON.stringify(selectedNeighborhoods));

        // Retrieve the user's choice from localStorage
        const userChoice = localStorage.getItem('userChoice');
        
        // Navigate to the appropriate page based on the user's choice
        if (userChoice === 'food') {
            window.location.href = 'food.html';
        } else if (userChoice === 'drink') {
            window.location.href = 'drink.html';
        } else {
            // Default behavior if no choice is stored (optional)
            console.warn('User choice not found. Redirecting to default page.');
            window.location.href = 'default.html';
        }
    }
});


        // Update selected neighborhoods display
        function updateSelectedNeighborhoods() {
            const selectedNeighborhoods = Array.from(document.querySelectorAll('input[name="neighborhood"]'))
                .filter(checkbox => checkbox.checked)
                .map(checkbox => checkbox.value);
            
            document.getElementById('selected-neighborhoods').textContent = `Selected Neighborhoods: ${selectedNeighborhoods.length > 0 ? selectedNeighborhoods.join(', ') : 'None'}`;
        }

        // Initial update of the displayed neighborhoods
        document.addEventListener('DOMContentLoaded', function() {
            updateSelectedNeighborhoods();
        });


        document.addEventListener('DOMContentLoaded', function() {
            // Retrieve the user's choice from localStorage
            const userChoice = localStorage.getItem('userChoice');
            const submitButton = document.querySelector('.submit-button');
            
            // Update the button text based on the user's choice
            if (userChoice === 'food') {
                submitButton.textContent = "Let's Eat!";
            } else if (userChoice === 'drink') {
                submitButton.textContent = "Let's Drink!";
            }
        });