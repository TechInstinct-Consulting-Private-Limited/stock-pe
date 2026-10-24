-- Wallets are linked once during onboarding. This index prevents the same
-- network/address pair from being claimed by more than one user.
CREATE UNIQUE INDEX IF NOT EXISTS usdt_wallets_network_address_unique_idx
    ON usdt_wallets (network, address);
