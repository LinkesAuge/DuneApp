import pandas as pd
import os

files = {
    "Items": "resources/ItemsDbReworkSample.xlsx",
    "Tiers": "resources/TiersReworkDb.xlsx",
    "Recipes": "resources/RecipesReworkDbSample.xlsx",
    "RecipeOutputs": "resources/RecipeOutputsReworkDbSample.xlsx",
    "RecipeIngredients": "resources/RecipeIngredientsReworkDbSample.xlsx",
}

for name, filepath in files.items():
    if os.path.exists(filepath):
        print(f"\n=== {name} Table ===")
        df = pd.read_excel(filepath)
        print(f"Columns: {list(df.columns)}")
        print(f"Rows: {len(df)}")
        print("Sample data:")
        print(df.head(3))
        print("-" * 50)
    else:
        print(f"\n{name}: File not found - {filepath}")
