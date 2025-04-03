import os
import json
import pandas as pd
import logging

logger = logging.getLogger(__name__)

def save_grant_data(grant_data, grant_type):
    # Get the parent directory (scraper) path
    root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    data_dir = os.path.join(root_dir, "data")
    
    grant_dirs = {
        'HC': 'hc_grant',
        'Kindred': 'kc_grant',
        'OTF': 'otf_grant'  # Renamed from otf_grants to otf_grant for consistency
    }
    
    grant_dir = None
    for prefix, directory in grant_dirs.items():
        if grant_type.startswith(prefix):
            grant_dir = directory
            break
    
    if not grant_dir:
        logger.error(f"Unknown grant type: {grant_type}")
        return

    # Ensure directory exists
    grant_dir_path = os.path.join(data_dir, grant_dir)
    os.makedirs(grant_dir_path, exist_ok=True)
    
    # Define file paths
    individual_csv = os.path.join(grant_dir_path, "grant.csv")
    individual_json = os.path.join(grant_dir_path, "grant.json")
    combined_csv = os.path.join(data_dir, "all_grants.csv")
    combined_json = os.path.join(data_dir, "all_grants.json")
    
    # Save to individual files in the type-specific directory
    try:
        pd.DataFrame([grant_data]).to_csv(individual_csv, index=False)
        logger.info(f"Saved CSV to {individual_csv}")
    except Exception as e:
        logger.error(f"Error saving CSV to {individual_csv}: {e}")
    
    try:
        with open(individual_json, 'w', encoding='utf-8') as f:
            json.dump(grant_data, f, ensure_ascii=False, indent=4)
        logger.info(f"Saved JSON to {individual_json}")
    except Exception as e:
        logger.error(f"Error saving JSON to {individual_json}: {e}")
    
    # Update combined CSV file with deduplication
    try:
        new_df = pd.DataFrame([grant_data])
        if os.path.exists(combined_csv) and os.path.getsize(combined_csv) > 0:
            try:
                existing_df = pd.read_csv(combined_csv)
                # Check if grant_id already exists
                if 'grant_id' in existing_df.columns and grant_data['grant_id'] in existing_df['grant_id'].values:
                    # Update the existing row
                    existing_df.loc[existing_df['grant_id'] == grant_data['grant_id']] = new_df.iloc[0]
                    combined_df = existing_df
                else:
                    # Append the new row
                    combined_df = pd.concat([existing_df, new_df], ignore_index=True)
            except pd.errors.EmptyDataError:
                # Handle empty file
                logger.warning(f"CSV file {combined_csv} is empty, creating new file")
                combined_df = new_df
            except Exception as e:
                logger.warning(f"Error reading {combined_csv}, creating new file: {e}")
                combined_df = new_df
        else:
            combined_df = new_df
        
        combined_df.to_csv(combined_csv, index=False)
        logger.info(f"Updated combined CSV at {combined_csv}")
    except Exception as e:
        logger.error(f"Error updating combined CSV: {e}")
    
    # Update combined JSON file with deduplication
    try:
        existing_data = []
        if os.path.exists(combined_json) and os.path.getsize(combined_json) > 0:
            try:
                with open(combined_json, 'r', encoding='utf-8') as f:
                    content = f.read().strip()
                    if content:  # Check if file has content
                        existing_data = json.loads(content)
                        if not isinstance(existing_data, list):
                            existing_data = [existing_data]
            except json.JSONDecodeError:
                logger.warning(f"Error parsing JSON from {combined_json}, creating new file")
            except Exception as e:
                logger.warning(f"Error reading {combined_json}, creating new file: {e}")
        
        # Check if grant_id already exists and update instead of append
        grant_updated = False
        for i, grant in enumerate(existing_data):
            if grant.get('grant_id') == grant_data['grant_id']:
                existing_data[i] = grant_data
                grant_updated = True
                break
        
        if not grant_updated:
            existing_data.append(grant_data)
            
        with open(combined_json, 'w', encoding='utf-8') as f:
            json.dump(existing_data, f, ensure_ascii=False, indent=4)
        logger.info(f"Updated combined JSON at {combined_json}")
    except Exception as e:
        logger.error(f"Error updating combined JSON: {e}")
    
    logger.info(f"Saved grant data to {grant_dir} and updated combined files")