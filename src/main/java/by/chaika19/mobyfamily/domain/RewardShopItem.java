package by.chaika19.mobyfamily.domain;

import jakarta.persistence.*;
import java.time.*;
import java.util.UUID;

@Entity
@Table(name = "reward_shop_item")
public class RewardShopItem extends BaseEntity {
  @Column(name = "family_id", nullable = true)
  public UUID familyId;

  @Column(name = "item_type", nullable = false)
  public String itemType;

  @Column(name = "title", nullable = false)
  public String title;

  @Column(name = "asset_code", nullable = false)
  public String assetCode;

  @Column(name = "cost_coins", nullable = false)
  public int costCoins;

  @Column(name = "rarity", nullable = false)
  public String rarity;
}
