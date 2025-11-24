export const ITEM_PER_PAGE = 10;

type RouteAccessMap = {
  [key: string]: string[];
};

export const routeAccessMap: RouteAccessMap = {
  "/list/users(.*)": ["administrator"],
  "/list/buildings(.*)": ["administrator"],
  "/list/reports(.*)": ["administrator"],
  "/list/inspections(.*)": ["administrator", "technician"],
  
  "/inspections/(.*)": ["administrator", "technician"],
  
  "/administrator(.*)": ["administrator"],
  "/technician(.*)": ["technician"],
};