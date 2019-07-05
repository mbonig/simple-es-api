#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("source-map-support/register");
const cdk = require("@aws-cdk/core");
const api_stack_1 = require("../lib/api-stack");
const app = new cdk.App();
const props = {
    buildAPIGateway: true,
    aggregators: ['default'],
    ...require('../apiStack.props.json')
};
new api_stack_1.ApiStack(app, 'ApiStack', props);
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXBpLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYXBpLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7OztBQUNBLHVDQUFxQztBQUNyQyxxQ0FBc0M7QUFDdEMsZ0RBQTRDO0FBRTVDLE1BQU0sR0FBRyxHQUFHLElBQUksR0FBRyxDQUFDLEdBQUcsRUFBRSxDQUFDO0FBRTFCLE1BQU0sS0FBSyxHQUFHO0lBQ1YsZUFBZSxFQUFFLElBQUk7SUFDckIsV0FBVyxFQUFFLENBQUMsU0FBUyxDQUFDO0lBQ3hCLEdBQUcsT0FBTyxDQUFDLHdCQUF3QixDQUFDO0NBQ3ZDLENBQUM7QUFFRixJQUFJLG9CQUFRLENBQUMsR0FBRyxFQUFFLFVBQVUsRUFBRSxLQUFLLENBQUMsQ0FBQyIsInNvdXJjZXNDb250ZW50IjpbIiMhL3Vzci9iaW4vZW52IG5vZGVcbmltcG9ydCAnc291cmNlLW1hcC1zdXBwb3J0L3JlZ2lzdGVyJztcbmltcG9ydCBjZGsgPSByZXF1aXJlKCdAYXdzLWNkay9jb3JlJyk7XG5pbXBvcnQgeyBBcGlTdGFjayB9IGZyb20gJy4uL2xpYi9hcGktc3RhY2snO1xuXG5jb25zdCBhcHAgPSBuZXcgY2RrLkFwcCgpO1xuXG5jb25zdCBwcm9wcyA9IHtcbiAgICBidWlsZEFQSUdhdGV3YXk6IHRydWUsXG4gICAgYWdncmVnYXRvcnM6IFsnZGVmYXVsdCddLFxuICAgIC4uLnJlcXVpcmUoJy4uL2FwaVN0YWNrLnByb3BzLmpzb24nKVxufTtcblxubmV3IEFwaVN0YWNrKGFwcCwgJ0FwaVN0YWNrJywgcHJvcHMpO1xuIl19