// the Sun's Diameter is like 1.39 million kilometer, the Earth's Diameter is like 12.742 kilometer
// and the Moon's Diameter is like 3.474 kilometer so we won't use the real Distances because it is very huge
// The Distance between the Earth and the Moon is like 384.400 kilometer
// The Distance between the Earth and The Sun is like 150 million kilometer
// 1 Unit = 100,000 kilometer so the distances and the diameters will be realistic
// the unit will be static for all the physics rules so that it will be easier for us to manage them
// LEO Distance is about (~160km), MEO Distance is about (~20,200km)
// قطر الشمس تقريباً هو 1.39 مليون كيلومتر وقطر الأرض تقريباً هو 12.742 كيلومتر وقطر القمر هو 3.474 كليومتر تقريباً
// المسافة بين القمر والأرض حوالي 384.400 كيلومتر بينما المسافة بين الشمس والأرض حوالي 150 مليون كيلومتر
// الوحدة = 100,000 كيلومتر فالأبعاد والأقطار ستكون حقيقية بناءً على الواقع
// الوحدة ستكون ثابتة للمشروع بأكمله مما يسهل علينا حساب القوانين الفيزيائية لاحقاً

//Diameters
const EARTH_DIAMETER = 0.1274;
const SUN_DIAMETER = 13.9;
const MOON_DIAMETER = 0.0347;
const SATELLITE_DIAMETER = 0.001;

// Distances
const EARTH_MOON_DISTANCE = 3.844;
const EARTH_SUN_DISTANCE = 1496;
const LEO_ALTITUDE = 0.0016;
const MEO_ALTITUDE = 0.02;
const GEO_ALTITUDE = 0.35786;

//Height Of
const ATMOSPHERE_HEIGHT_FROM_EARTH = 0.16371;

//Gravitational Constant
const G = 0.000001;

//Exporting
export {
  EARTH_DIAMETER,
  SUN_DIAMETER,
  MOON_DIAMETER,
  SATELLITE_DIAMETER,
  EARTH_MOON_DISTANCE,
  EARTH_SUN_DISTANCE,
  ATMOSPHERE_HEIGHT_FROM_EARTH,
  LEO_ALTITUDE,
  MEO_ALTITUDE,
  GEO_ALTITUDE,
  G,
};
