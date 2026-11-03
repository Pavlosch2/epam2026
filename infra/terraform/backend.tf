terraform {
  required_version = ">= 1.10"
  backend "s3" {
    bucket = "restaurant-terraform-state-pavlo-2026-v2"
    key    = "restaurant/terraform.tfstate"
    region = "eu-central-1"
  }
}
