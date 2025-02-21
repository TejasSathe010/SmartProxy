LOAD_BALANCE_STRATEGY=round_robin node main.js --config config.yaml

LOAD_BALANCE_STRATEGY=least_connections node main.js --config config.yaml
