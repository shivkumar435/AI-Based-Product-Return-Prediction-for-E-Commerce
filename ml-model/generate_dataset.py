import pandas as pd
import numpy as np
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

def generate_dataset(n_samples=2000):
    np.random.seed(42)
    
    customer_age = np.random.randint(18, 71, n_samples)
    gender = np.random.choice(['Male', 'Female'], n_samples)
    categories = ['Electronics', 'Clothing', 'Shoes', 'Home & Kitchen', 'Beauty', 'Sports', 'Books']
    product_category = np.random.choice(categories, n_samples)
    product_price = np.random.uniform(5, 500, n_samples)
    discount = np.random.uniform(0, 50, n_samples)
    quantity = np.random.randint(1, 11, n_samples)
    payments = ['Credit Card', 'Debit Card', 'UPI', 'Cash on Delivery', 'Net Banking']
    payment_method = np.random.choice(payments, n_samples)
    delivery_time = np.random.randint(1, 16, n_samples)
    shipping_distance = np.random.uniform(5, 500, n_samples)
    previous_returns = np.random.randint(0, 11, n_samples)
    customer_rating = np.random.randint(1, 6, n_samples)
    order_frequency = np.random.randint(1, 51, n_samples)
    
    # Calculate return probability
    prob_return = np.full(n_samples, 0.1)  # base probability
    
    # Adjust probability based on rules
    prob_return += np.where(discount > 30, 0.2, 0)
    prob_return += np.where(previous_returns > 3, 0.3, 0)
    prob_return += np.where(customer_rating < 3, 0.2, 0)
    prob_return += np.where(payment_method == 'Cash on Delivery', 0.15, 0)
    prob_return += np.where(delivery_time > 7, 0.15, 0)
    prob_return += np.where(np.isin(product_category, ['Clothing', 'Shoes']), 0.2, 0)
    prob_return += np.where(shipping_distance > 300, 0.1, 0)
    
    # Normalize and ensure between 0 and 1
    prob_return = np.clip(prob_return, 0.05, 0.95)
    
    # Generate target variable
    return_status = np.random.binomial(1, prob_return)
    
    df = pd.DataFrame({
        'Customer_Age': customer_age,
        'Gender': gender,
        'Product_Category': product_category,
        'Product_Price': np.round(product_price, 2),
        'Discount': np.round(discount, 2),
        'Quantity': quantity,
        'Payment_Method': payment_method,
        'Delivery_Time': delivery_time,
        'Shipping_Distance': np.round(shipping_distance, 2),
        'Previous_Returns': previous_returns,
        'Customer_Rating': customer_rating,
        'Order_Frequency': order_frequency,
        'Return_Status': return_status
    })
    
    output_path = os.path.join(BASE_DIR, 'dataset.csv')
    df.to_csv(output_path, index=False)
    print(f"Generated dataset with {n_samples} rows and saved to {output_path}")
    print("Return Status Distribution:")
    print(df['Return_Status'].value_counts(normalize=True))

if __name__ == "__main__":
    generate_dataset()
