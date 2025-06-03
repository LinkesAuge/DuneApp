import pandas as pd

# Read tiers data
df = pd.read_excel("resources/TiersReworkDb.xlsx")

print("All tiers:")
print(df)

print("\nNull tier_name rows:")
null_rows = df[df["tier_name"].isnull()]
print(null_rows)

print("\nData types:")
print(df.dtypes)
