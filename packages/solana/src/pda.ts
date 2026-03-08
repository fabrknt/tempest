import { PublicKey } from "@solana/web3.js";

/**
 * Placeholder program ID for the Tempest Solana program.
 * Replace with the actual deployed program ID.
 */
export const TEMPEST_PROGRAM_ID = new PublicKey(
  "11111111111111111111111111111111" // Placeholder — replace after deployment
);

/**
 * Derive PDA for a pool's volatility state.
 * Seed: ["vol_state", pool_id_bytes]
 */
export function findVolStatePDA(
  poolId: PublicKey,
  programId: PublicKey = TEMPEST_PROGRAM_ID,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("vol_state"), poolId.toBuffer()],
    programId,
  );
}

/**
 * Derive PDA for a pool's fee configuration.
 * Seed: ["fee_config", pool_id_bytes]
 */
export function findFeeConfigPDA(
  poolId: PublicKey,
  programId: PublicKey = TEMPEST_PROGRAM_ID,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("fee_config"), poolId.toBuffer()],
    programId,
  );
}

/**
 * Derive PDA for the global Tempest config.
 * Seed: ["tempest_config"]
 */
export function findTempestConfigPDA(
  programId: PublicKey = TEMPEST_PROGRAM_ID,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("tempest_config")],
    programId,
  );
}

/**
 * Derive PDA for the tick observation buffer.
 * Seed: ["tick_buffer", pool_id_bytes]
 */
export function findTickBufferPDA(
  poolId: PublicKey,
  programId: PublicKey = TEMPEST_PROGRAM_ID,
): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from("tick_buffer"), poolId.toBuffer()],
    programId,
  );
}
